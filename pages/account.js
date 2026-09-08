// ============================================================
// My Account page: view/edit the signed-in customer's profile
// (backed by the `customers` table — see
// supabase-migrations/001_customers.sql) and see their take-back
// request history.
// ============================================================

const loadingEl = document.getElementById("account-loading");
const signedOutEl = document.getElementById("account-signed-out");
const contentEl = document.getElementById("account-content");

const profileForm = document.getElementById("profile-form");
const profileSaveBtn = document.getElementById("profile-save-btn");
const profileStatus = document.getElementById("profile-status");

const takebackStatusEl = document.getElementById("takeback-status");
const takebackListEl = document.getElementById("takeback-list");

let currentUser = null;

function setStatus(el, message, kind) {
  if (!message) { el.innerHTML = ""; return; }
  const cls = kind === "error" ? "banner banner-error" : "banner banner-success";
  el.innerHTML = `<div class="${cls}">${message}</div>`;
}

async function init() {
  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    loadingEl.hidden = true;
    signedOutEl.hidden = false;
    return;
  }

  currentUser = user;
  document.getElementById("acc-email").value = user.email || "";

  const { data: customer } = await supabaseClient
    .from("customers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (customer) {
    document.getElementById("acc-full-name").value = customer.full_name || "";
    document.getElementById("acc-phone").value = customer.phone || "";
    document.getElementById("acc-country").value = customer.country || "India";
    document.getElementById("acc-address1").value = customer.address_line1 || "";
    document.getElementById("acc-address2").value = customer.address_line2 || "";
    document.getElementById("acc-city").value = customer.city || "";
    document.getElementById("acc-state").value = customer.state || "";
    document.getElementById("acc-postal").value = customer.postal_code || "";
  }

  loadingEl.hidden = true;
  contentEl.hidden = false;

  loadTakebackHistory(user.id);
  loadOrderHistory(user.id);
}

async function loadOrderHistory(userId) {
  const ordersStatusEl = document.getElementById("orders-status");
  const ordersListEl = document.getElementById("orders-list");

  const { data, error } = await supabaseClient
    .from("orders")
    .select("id, status, amount_total, currency, created_at, order_items ( product_name, quantity )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    ordersStatusEl.textContent = "Couldn't load your orders.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    ordersStatusEl.textContent = "You haven't placed any orders yet.";
    return;
  }

  ordersStatusEl.textContent = "";
  ordersListEl.innerHTML = data.map((o) => {
    const itemCount = (o.order_items || []).reduce((sum, i) => sum + i.quantity, 0);
    return `
      <div class="surface-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="font-semibold m-0">Order #${o.id} · ₹${Number(o.amount_total).toFixed(0)}</p>
          <p class="text-[0.82rem] text-[#6b6459] m-0">
            ${new Date(o.created_at).toLocaleDateString()} · ${itemCount} item${itemCount === 1 ? "" : "s"}
          </p>
        </div>
        <span class="badge ${o.status === "paid" ? "badge-moss" : "badge-muted"}">${o.status}</span>
      </div>
    `;
  }).join("");
}

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser) return;

  profileSaveBtn.disabled = true;
  profileSaveBtn.innerHTML = `<span class="spinner"></span> Saving…`;
  setStatus(profileStatus, "");

  const { error } = await supabaseClient.from("customers").upsert({
    id: currentUser.id,
    email: currentUser.email,
    full_name: document.getElementById("acc-full-name").value.trim() || null,
    phone: document.getElementById("acc-phone").value.trim() || null,
    country: document.getElementById("acc-country").value.trim() || "India",
    address_line1: document.getElementById("acc-address1").value.trim() || null,
    address_line2: document.getElementById("acc-address2").value.trim() || null,
    city: document.getElementById("acc-city").value.trim() || null,
    state: document.getElementById("acc-state").value.trim() || null,
    postal_code: document.getElementById("acc-postal").value.trim() || null,
  }, { onConflict: "id" });

  profileSaveBtn.disabled = false;
  profileSaveBtn.textContent = "Save changes";

  if (error) {
    setStatus(profileStatus, "Couldn't save your details. " + error.message, "error");
    console.error(error);
    return;
  }
  setStatus(profileStatus, "Saved.", "success");
});

async function loadTakebackHistory(userId) {
  const { data, error } = await supabaseClient
    .from("take_back_requests")
    .select("id, item_category, material, condition_reported, pickup_or_dropoff, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    takebackStatusEl.textContent = "Couldn't load your take-back history.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    takebackStatusEl.textContent = "You haven't sent anything in yet.";
    return;
  }

  takebackStatusEl.textContent = "";
  takebackListEl.innerHTML = data.map((r) => `
    <div class="surface-card rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-semibold m-0">${r.item_category}${r.material ? ` · ${r.material}` : ""}</p>
        <p class="text-[0.82rem] text-[#6b6459] m-0">
          ${new Date(r.created_at).toLocaleDateString()} · ${r.pickup_or_dropoff === "pickup" ? "Pickup requested" : "Drop-off"}
        </p>
      </div>
      <span class="badge ${r.status === "completed" ? "badge-moss" : "badge-indigo"}">${r.status ? r.status.replace(/_/g, " ") : "Submitted"}</span>
    </div>
  `).join("");
}

init();
