// ============================================================
// Edge Function: create-razorpay-order
//
// Why this needs to exist at all: Razorpay's "create order" API
// call requires your SECRET key, which must never be shipped to
// the browser. This function holds that secret (as an environment
// variable) and is the only thing allowed to call Razorpay to open
// an order. The browser only ever sees the public "key_id" and the
// order_id this function hands back.
//
// Deploy with:
//   supabase functions deploy create-razorpay-order
// Set secrets with:
//   supabase secrets set RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
//   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Identify the signed-in user from the request's auth header —
    // we never trust an amount the browser sends us blindly without
    // knowing who's asking.
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401, headers: corsHeaders });
    }

    const { cart } = await req.json();
    // cart: [{ productId, variantId, price, quantity, name }]
    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ error: "Cart is empty." }), { status: 400, headers: corsHeaders });
    }

    // Recompute the total server-side — never trust a total the
    // browser sends you, since that's exactly what someone could
    // tamper with to pay ₹1 for a ₹5,000 order.
    const amountRupees = cart.reduce((sum: number, line: any) => sum + Number(line.price) * Number(line.quantity), 0);
    const amountPaise = Math.round(amountRupees * 100);

    if (amountPaise <= 0) {
      return new Response(JSON.stringify({ error: "Invalid order amount." }), { status: 400, headers: corsHeaders });
    }

    // Razorpay's "Orders" API — https://razorpay.com/docs/api/orders/
    const razorpayRes = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`),
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `rethread_${user.id.slice(0, 8)}_${Date.now()}`,
        notes: { user_id: user.id },
      }),
    });

    const razorpayOrder = await razorpayRes.json();
    if (!razorpayRes.ok) {
      return new Response(JSON.stringify({ error: razorpayOrder.error?.description || "Razorpay order creation failed." }), {
        status: 502,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: RAZORPAY_KEY_ID, // public — safe to send to the browser
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
