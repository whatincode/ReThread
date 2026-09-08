// ============================================================
// Sign in / create account page.
// ============================================================

let mode = "signin"; // or "signup"

const tabSignIn = document.getElementById("tab-signin");
const tabSignUp = document.getElementById("tab-signup");
const form = document.getElementById("auth-form");
const nameField = document.getElementById("name-field");
const submitBtn = document.getElementById("auth-submit-btn");
const statusMsg = document.getElementById("auth-status-msg");
const headingEl = document.getElementById("auth-heading");
const subheadingEl = document.getElementById("auth-subheading");
const passwordHint = document.getElementById("password-hint");

const resetForm = document.getElementById("reset-form");
const resetStatusMsg = document.getElementById("reset-status-msg");
const forgotLink = document.getElementById("forgot-password-link");
const backToSignIn = document.getElementById("back-to-signin");

const newPasswordForm = document.getElementById("new-password-form");
const newPasswordStatusMsg = document.getElementById("new-password-status-msg");
const newPasswordSubmitBtn = document.getElementById("new-password-submit-btn");

// ============================================================
// Email confirmation & password recovery links land back on this
// page. Supabase's JS client auto-detects the access token in the
// URL and fires onAuthStateChange — we just react to it here.
// ============================================================

function showOnly(sectionToShow) {
  [form, resetForm, newPasswordForm].forEach((el) => {
    if (el) el.hidden = el !== sectionToShow;
  });
}

// Was this page opened via a Supabase auth email link? (confirm-signup
// or recovery links both put a "type" param in the URL hash or query.)
const urlParams = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
const linkType = urlParams.get("type") || hashParams.get("type");

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    headingEl.textContent = "Choose a new password";
    subheadingEl.textContent = "You're verified — set a new password to finish resetting your account.";
    showOnly(newPasswordForm);
    return;
  }

  if (event === "SIGNED_IN" && linkType === "signup" && session && session.user) {
    // They just clicked the "confirm your email" link.
    ensureCustomerProfile(session.user, null);
    headingEl.textContent = "Email confirmed 🎉";
    subheadingEl.textContent = "Your account is verified and you're signed in.";
    showOnly(form);
    setStatus(statusMsg, "Email confirmed — redirecting you in…", "success");
    window.history.replaceState({}, "", window.location.pathname);
    setTimeout(() => { window.location.href = "../index.html"; }, 1400);
  }
});

function setStatus(el, message, kind) {
  // kind: "error" | "success" | null
  if (!message) {
    el.innerHTML = "";
    return;
  }
  const cls = kind === "error" ? "banner banner-error" : kind === "success" ? "banner banner-success" : "";
  el.innerHTML = cls ? `<div class="${cls}">${message}</div>` : message;
}

function setMode(newMode) {
  mode = newMode;
  tabSignIn.classList.toggle("is-active", mode === "signin");
  tabSignUp.classList.toggle("is-active", mode === "signup");
  nameField.hidden = mode !== "signup";
  passwordHint.hidden = mode !== "signup";
  submitBtn.textContent = mode === "signin" ? "Sign In" : "Create Account";
  headingEl.textContent = mode === "signin" ? "Welcome back" : "Create your account";
  subheadingEl.textContent = mode === "signin"
    ? "Sign in to check out, track take-backs, and manage your account."
    : "Join ReThread to shop, sell your clothes, and track your orders.";
  setStatus(statusMsg, "");
  toggleDemoBoxVisibility();
}

tabSignIn.addEventListener("click", () => setMode("signin"));
tabSignUp.addEventListener("click", () => setMode("signup"));

// ---- Demo account quick-fill ----
const demoBox = document.getElementById("demo-account-box");
const useDemoBtn = document.getElementById("use-demo-btn");
if (useDemoBtn) {
  useDemoBtn.addEventListener("click", () => {
    setMode("signin");
    document.getElementById("auth-email").value = "demo@rethread.app";
    document.getElementById("auth-password").value = "Demo@1234";
    setStatus(statusMsg, "Demo details filled in — hit Sign In below.", "success");
  });
}
function toggleDemoBoxVisibility() {
  if (demoBox) demoBox.hidden = mode !== "signin";
}

// ---- Show / hide password ----
const passwordInput = document.getElementById("auth-password");
const togglePasswordBtn = document.getElementById("toggle-password");
togglePasswordBtn.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePasswordBtn.textContent = showing ? "Show" : "Hide";
});

// ---- Ensure a customers row exists for this user (belt-and-suspenders
//      alongside the DB trigger — see supabase-migrations/001_customers.sql) ----
async function ensureCustomerProfile(user, fullName) {
  if (!user) return;
  try {
    await supabaseClient.from("customers").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: fullName || (user.user_metadata && user.user_metadata.full_name) || null,
      },
      { onConflict: "id" }
    );
  } catch (e) {
    // Non-fatal — the DB trigger (if installed) already covers this.
    console.warn("Could not upsert customer profile:", e);
  }
}

function setLoading(btn, isLoading, label) {
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? `<span class="spinner"></span> ${label}` : label;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("auth-name").value.trim();
  const email = document.getElementById("auth-email").value.trim();
  const password = passwordInput.value;

  setLoading(submitBtn, true, mode === "signin" ? "Signing in…" : "Creating account…");
  setStatus(statusMsg, "");

  let result;
  if (mode === "signin") {
    result = await supabaseClient.auth.signInWithPassword({ email, password });
  } else {
    result = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: fullName ? { full_name: fullName } : undefined,
        // Send them back to this exact page so we can catch the
        // confirmation and sign them in automatically (see the
        // onAuthStateChange listener above).
        emailRedirectTo: window.location.origin + window.location.pathname + "?type=signup",
      },
    });
  }

  if (result.error) {
    setLoading(submitBtn, false, mode === "signin" ? "Sign In" : "Create Account");
    let message = result.error.message;
    const isDemoAttempt = mode === "signin" && email.toLowerCase() === "demo@rethread.app";
    if (isDemoAttempt && /invalid login credentials/i.test(message)) {
      message = "The demo account (demo@rethread.app) hasn't been created in this Supabase project yet. This is a one-time setup step — see \"Create the demo account\" in SETUP.md (Supabase Dashboard → Authentication → Users → Add user), then run supabase-migrations/006_demo_account.sql.";
    } else if (/email not confirmed/i.test(message)) {
      message = "This email hasn't been confirmed yet. Check your inbox for the confirmation link, or use the demo account above to explore ReThread right away.";
    } else if (/invalid login credentials/i.test(message)) {
      message = "That email/password combination didn't work. Double-check it, or try the demo account above.";
    }
    setStatus(statusMsg, message, "error");
    return;
  }

  if (mode === "signup" && !result.data.session) {
    // Email confirmation required before a session exists
    setLoading(submitBtn, false, "Create Account");
    setStatus(statusMsg, "Account created — check your email to confirm before signing in.", "success");
    return;
  }

  const user = result.data.user || (result.data.session && result.data.session.user);
  await ensureCustomerProfile(user, fullName);

  setStatus(statusMsg, "Signed in — redirecting…", "success");
  setTimeout(() => {
    window.location.href = "../index.html";
  }, 700);
});

// ---- Forgot password ----
forgotLink.addEventListener("click", () => {
  form.hidden = true;
  resetForm.hidden = false;
  document.getElementById("reset-email").value = document.getElementById("auth-email").value;
  headingEl.textContent = "Reset your password";
  subheadingEl.textContent = "We'll email you a secure link.";
});

backToSignIn.addEventListener("click", () => {
  resetForm.hidden = true;
  form.hidden = false;
  setStatus(resetStatusMsg, "");
  setMode(mode);
});

resetForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reset-email").value.trim();
  const resetSubmitBtn = document.getElementById("reset-submit-btn");

  setLoading(resetSubmitBtn, true, "Sending…");
  setStatus(resetStatusMsg, "");

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname + "?type=recovery",
  });

  setLoading(resetSubmitBtn, false, "Send reset link");

  if (error) {
    setStatus(resetStatusMsg, error.message, "error");
    return;
  }
  setStatus(resetStatusMsg, "If that email has an account, a reset link is on its way.", "success");
});

// ---- Set a new password (after arriving via a recovery link) ----
newPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value;

  setLoading(newPasswordSubmitBtn, true, "Updating…");
  setStatus(newPasswordStatusMsg, "");

  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });

  setLoading(newPasswordSubmitBtn, false, "Update password");

  if (error) {
    setStatus(newPasswordStatusMsg, error.message, "error");
    return;
  }

  setStatus(newPasswordStatusMsg, "Password updated — redirecting…", "success");
  window.history.replaceState({}, "", window.location.pathname);
  setTimeout(() => { window.location.href = "../index.html"; }, 1200);
});
