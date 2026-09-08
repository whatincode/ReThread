// ============================================================
// Edge Function: verify-razorpay-payment
//
// After Razorpay's checkout popup succeeds, the browser gets back
// razorpay_payment_id, razorpay_order_id, and razorpay_signature.
// Anyone could fake those three strings in a browser console, so
// we NEVER trust "payment succeeded" from the client directly.
// Instead: recompute the signature ourselves (HMAC-SHA256 of
// "order_id|payment_id" using the secret key) and only mark the
// order paid if it matches exactly. This is the standard Razorpay
// server-side verification step.
//
// This function uses the service_role key (full DB access,
// bypassing RLS) purely to insert the confirmed order — that's why
// it has to run on the server, never in the browser.
//
// Deploy with:
//   supabase functions deploy verify-razorpay-payment
// Secrets (same as create-razorpay-order, plus the service role key
// which Supabase provides automatically as SUPABASE_SERVICE_ROLE_KEY):
//   supabase secrets set RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacHex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Not signed in." }), { status: 401, headers: corsHeaders });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cart,
      shipping,
    } = await req.json();

    // ---- The actual security check ----
    const expectedSignature = await hmacHex(RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (expectedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Payment signature did not match. Payment not trusted." }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Signature is valid — now write the order using the service
    // role client, which bypasses RLS (customers can only read
    // orders, never write them directly).
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const amountTotal = cart.reduce((sum: number, line: any) => sum + Number(line.price) * Number(line.quantity), 0);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        razorpay_order_id,
        razorpay_payment_id,
        status: "paid",
        amount_total: amountTotal,
        currency: "INR",
        shipping_name: shipping?.name || null,
        shipping_phone: shipping?.phone || null,
        shipping_address_line1: shipping?.address_line1 || null,
        shipping_address_line2: shipping?.address_line2 || null,
        shipping_city: shipping?.city || null,
        shipping_state: shipping?.state || null,
        shipping_postal_code: shipping?.postal_code || null,
        shipping_country: shipping?.country || "India",
        paid_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      return new Response(JSON.stringify({ error: "Payment verified but saving the order failed: " + orderError.message }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const orderItems = (cart as any[]).map((line) => {
      const isUpcycled = line.itemType === "upcycled";
      return {
        order_id: order.id,
        product_id: isUpcycled ? null : line.productId,
        upcycled_item_id: isUpcycled ? line.productId : null,
        variant_id: line.variantId || null,
        product_name: line.name,
        unit_price: line.price,
        quantity: line.quantity,
      };
    });

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) {
      // Most likely cause: supabase-migrations/007_circle_checkout_and_reviews.sql
      // hasn't been run yet, so `upcycled_item_id` doesn't exist / product_id is
      // still NOT NULL. Retry with the pre-migration shape so a normal (non-Circle)
      // checkout still succeeds instead of silently losing its order items.
      console.error("order_items insert failed, retrying without upcycled_item_id:", itemsError.message);
      const legacyItems = orderItems
        .filter((item) => item.product_id !== null)
        .map(({ upcycled_item_id, ...rest }) => rest);
      if (legacyItems.length > 0) {
        const { error: retryError } = await supabaseAdmin.from("order_items").insert(legacyItems);
        if (retryError) console.error("order_items retry also failed:", retryError.message);
      }
    }

    return new Response(JSON.stringify({ success: true, order_id: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
