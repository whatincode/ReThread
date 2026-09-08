// ============================================================
// Step 2 connection test:
// fetch a few products from Supabase and display them.
// If this works, your database connection is set up correctly.
// ============================================================

async function testConnection() {
  const statusEl = document.getElementById("status");
  const listEl = document.getElementById("product-list");

  const { data, error } = await supabaseClient
    .from("products")
    .select("name, selling_price")
    .limit(10);

  if (error) {
    statusEl.textContent = "❌ Connection failed. Check your URL/key in supabaseClient.js.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    statusEl.textContent = "⚠️ Connected, but no products found. Did you run seed.sql?";
    return;
  }

  statusEl.textContent = `✅ Connected! Found ${data.length} products (showing up to 10):`;

  data.forEach((product) => {
    const li = document.createElement("li");
    li.textContent = `${product.name} — ₹${product.selling_price}`;
    listEl.appendChild(li);
  });
}

testConnection();
