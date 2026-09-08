// ============================================================
// Checkout: collects shipping details, shows the order summary,
// then hands off to Razorpay Checkout for payment. The actual
// charge is created + verified by two Supabase Edge Functions
// (see /supabase/functions/) — this file never touches secret keys.
// ============================================================

const signedOutEl = document.getElementById("checkout-signed-out");
const emptyEl = document.getElementById("checkout-empty");
const contentEl = document.getElementById("checkout-content");
const shippingForm = document.getElementById("shipping-form");
const payBtn = document.getElementById("pay-btn");
const payBtnAmount = document.getElementById("pay-btn-amount");
const checkoutStatus = document.getElementById("checkout-status");

let currentUser = null;
let cart = [];

function setStatus(message, kind) {
  if (!message) { checkoutStatus.innerHTML = ""; return; }
  const cls = kind === "error" ? "banner banner-error" : kind === "success" ? "banner banner-success" : "banner banner-info";
  checkoutStatus.innerHTML = `<div class="${cls}">${message}</div>`;
}

function renderSummary() {
  const itemsEl = document.getElementById("summary-items");
  itemsEl.innerHTML = cart.map((line) => `
    <div class="flex gap-3 items-center">
      <div class="w-14 h-[70px] bg-cotton-dark bg-cover bg-center rounded-md border border-ink/10 shrink-0" style="background-image:url('${line.imageUrl || "https://placehold.co/300x400/e2dac8/6b6459?text=No+Image"}')"></div>
      <div class="flex-1 min-w-0">
        <p class="text-[0.9rem] font-medium truncate m-0">${line.name}</p>
        <p class="text-[0.8rem] text-[#6b6459] m-0">Qty ${line.quantity}${line.size ? ` · ${line.size}` : ""}</p>
      </div>
      <span class="text-[0.9rem] font-semibold">₹${(line.price * line.quantity).toFixed(0)}</span>
    </div>
  `).join("");

  const total = getCartTotal();
  document.getElementById("summary-subtotal").textContent = `₹${total.toFixed(0)}`;
  document.getElementById("summary-total").textContent = `₹${total.toFixed(0)}`;
  payBtnAmount.textContent = `₹${total.toFixed(0)}`;
}

async function prefillShipping(userId) {
  const { data: customer } = await supabaseClient.from("customers").select("*").eq("id", userId).maybeSingle();
  if (!customer) return;
  document.getElementById("ship-name").value = customer.full_name || "";
  document.getElementById("ship-phone").value = customer.phone || "";
  document.getElementById("ship-address1").value = customer.address_line1 || "";
  document.getElementById("ship-address2").value = customer.address_line2 || "";
  document.getElementById("ship-city").value = customer.city || "";
  document.getElementById("ship-state").value = customer.state || "";
  document.getElementById("ship-postal").value = customer.postal_code || "";
}

function getShipping() {
  return {
    name: document.getElementById("ship-name").value.trim(),
    phone: document.getElementById("ship-phone").value.trim(),
    address_line1: document.getElementById("ship-address1").value.trim(),
    address_line2: document.getElementById("ship-address2").value.trim(),
    city: document.getElementById("ship-city").value.trim(),
    state: document.getElementById("ship-state").value.trim(),
    postal_code: document.getElementById("ship-postal").value.trim(),
    country: "India",
  };
}

async function callFunction(name, body, accessToken) {
  const res = await fetch(`${window.SUPABASE_FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

payBtn.addEventListener("click", async () => {
  if (!shippingForm.reportValidity()) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    setStatus("Please sign in again before paying.", "error");
    return;
  }

  payBtn.disabled = true;
  payBtn.innerHTML = `<span class="spinner"></span> Preparing payment…`;
  setStatus("");

  try {
    // 1. Ask our Edge Function to open a Razorpay order (server-side,
    //    using the secret key — the browser never sees it).
    const order = await callFunction("create-razorpay-order", { cart }, session.access_token);

    // 2. Open Razorpay's hosted Checkout popup with that order_id.
    const rzp = new Razorpay({
      key: order.key_id,
      order_id: order.order_id,
      amount: order.amount,
      currency: order.currency,
      name: "ReThread",
      description: `${cart.length} item${cart.length === 1 ? "" : "s"}`,
      prefill: {
        name: getShipping().name,
        contact: getShipping().phone,
        email: currentUser.email,
      },
      theme: { color: "#b65a34" },
      handler: async (response) => {
        // 3. On success, Razorpay gives us payment_id + signature.
        //    We send those to our OTHER Edge Function, which
        //    verifies the signature server-side before trusting it
        //    and only then writes the order to the database.
        setStatus("Verifying payment…", null);
        try {
          const result = await callFunction("verify-razorpay-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            cart,
            shipping: getShipping(),
          }, session.access_token);

          localStorage.removeItem("rethread_cart");
          window.location.href = `order-success.html?order=${result.order_id}`;
        } catch (err) {
          setStatus("Payment succeeded but we couldn't confirm it: " + err.message + ". Contact support with your payment ID: " + response.razorpay_payment_id, "error");
        }
      },
      modal: {
        ondismiss: () => {
          payBtn.disabled = false;
          payBtn.innerHTML = `Pay <span id="pay-btn-amount">₹${getCartTotal().toFixed(0)}</span>`;
          setStatus("Payment cancelled — your bag is still saved.", null);
        },
      },
    });

    rzp.on("payment.failed", (resp) => {
      setStatus("Payment failed: " + resp.error.description, "error");
      payBtn.disabled = false;
      payBtn.innerHTML = `Pay <span id="pay-btn-amount">₹${getCartTotal().toFixed(0)}</span>`;
    });

    rzp.open();
    payBtn.disabled = false;
    payBtn.innerHTML = `Pay <span id="pay-btn-amount">₹${getCartTotal().toFixed(0)}</span>`;
  } catch (err) {
    setStatus(err.message, "error");
    payBtn.disabled = false;
    payBtn.innerHTML = `Pay <span id="pay-btn-amount">₹${getCartTotal().toFixed(0)}</span>`;
  }
});

async function init() {
  cart = getCart();
  if (cart.length === 0) {
    emptyEl.hidden = false;
    return;
  }

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    signedOutEl.hidden = false;
    return;
  }

  currentUser = user;
  contentEl.hidden = false;
  renderSummary();
  await prefillShipping(user.id);
}

init();
