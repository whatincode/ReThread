// ============================================================
// Auth utilities — shared across every page.
// Keeps the nav's "Sign In" button / account avatar menu in sync
// with the current Supabase Auth session (in both the desktop nav
// and the mobile slide-down menu), highlights whichever nav link
// matches the current page, and wires up the hamburger toggle.
//
// Pages can optionally set these before this script loads, to get
// correct relative links from wherever the page lives:
//   window.AUTH_HREF, window.ACCOUNT_HREF, window.BRAND_HREF
// ============================================================

function initialsFor(user) {
  const source = (user.user_metadata && user.user_metadata.full_name) || user.email || "?";
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function authNavMarkup(user, { accountHref, brandHref, menuId }) {
  const label = (user.user_metadata && user.user_metadata.full_name) || user.email || "Account";
  return `
    <div class="relative">
      <button id="${menuId}-btn" type="button" class="flex items-center gap-2 bg-transparent border-0 cursor-pointer p-1 rounded-full hover:bg-ink/5" aria-haspopup="true" aria-expanded="false">
        <span class="avatar-circle">${initialsFor(user)}</span>
      </button>
      <div id="${menuId}" hidden class="absolute right-0 mt-2 w-56 panel py-2 z-50 animate-fade-up">
        <div class="px-4 pb-2 mb-1 border-b border-ink/10">
          <p class="text-[0.85rem] font-semibold truncate m-0">${label}</p>
          <p class="text-[0.75rem] text-[#6b6459] m-0">Signed in</p>
        </div>
        <a href="${accountHref}" class="block px-4 py-2 text-[0.9rem] hover:bg-ink/5">My Account</a>
        <a href="${brandHref}" class="block px-4 py-2 text-[0.9rem] hover:bg-ink/5">Brand Portal</a>
        <button id="${menuId}-signout" type="button" class="block w-full text-left px-4 py-2 text-[0.9rem] text-rust font-semibold bg-transparent border-0 cursor-pointer hover:bg-rust/5">Sign Out</button>
      </div>
    </div>
  `;
}

function wireAccountMenu(menuId) {
  const menuBtn = document.getElementById(`${menuId}-btn`);
  const menu = document.getElementById(menuId);
  if (!menuBtn || !menu) return;

  function closeMenu() {
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    menuBtn.setAttribute("aria-expanded", String(!isOpen));
  });

  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const signOutBtn = document.getElementById(`${menuId}-signout`);
  if (signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      await supabaseClient.auth.signOut();
      window.location.href = window.HOME_HREF || "./";
    });
  }
}

async function updateAuthNav() {
  const desktopEl = document.getElementById("auth-status");
  const mobileEl = document.getElementById("auth-status-mobile");
  if ((!desktopEl && !mobileEl) || typeof supabaseClient === "undefined") return;

  const { data: { user } } = await supabaseClient.auth.getUser();

  const authHref = window.AUTH_HREF || "auth.html";
  const accountHref = window.ACCOUNT_HREF || "account.html";
  const brandHref = window.BRAND_HREF || "brand-portal.html";

  if (!user) {
    if (desktopEl) desktopEl.innerHTML = `<a href="${authHref}" class="btn btn-primary btn-sm">Sign In</a>`;
    if (mobileEl) mobileEl.innerHTML = `<a href="${authHref}" class="btn btn-primary btn-block">Sign In</a>`;
    return;
  }

  if (desktopEl) {
    desktopEl.innerHTML = authNavMarkup(user, { accountHref, brandHref, menuId: "account-menu" });
    wireAccountMenu("account-menu");
  }
  if (mobileEl) {
    mobileEl.innerHTML = `
      <a href="${accountHref}" class="mobile-nav-link">My Account</a>
      <a href="${brandHref}" class="mobile-nav-link">Brand Portal</a>
      <button id="mobile-signout" type="button" class="block w-full text-left mobile-nav-link text-rust font-semibold bg-transparent border-0 cursor-pointer">Sign Out</button>
    `;
    const mobileSignOut = document.getElementById("mobile-signout");
    if (mobileSignOut) {
      mobileSignOut.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        window.location.href = window.HOME_HREF || "./";
      });
    }
  }
}

// ---- Highlight the current page's nav link (desktop + mobile) ----
function highlightActiveNav() {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a[href]").forEach((link) => {
    const hrefFile = link.getAttribute("href").split("?")[0].split("/").pop();
    if (hrefFile === currentFile) {
      link.classList.add("nav-link-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

// ---- Hamburger toggle for the mobile slide-down menu ----
function initMobileNav() {
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("mobile-menu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    btn.setAttribute("aria-expanded", String(!isOpen));
  });

  // Close the mobile menu whenever a link inside it is used
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    });
  });

  // Collapse back to desktop layout cleanly on resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024 && !menu.hidden) {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNav();
  initMobileNav();
  // Small delay-free retry: supabaseClient.js loads before this,
  // but guard anyway in case script order ever changes.
  if (typeof supabaseClient !== "undefined") {
    updateAuthNav();
  }
});
