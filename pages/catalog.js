// ============================================================
// Catalog page: populates filters, fetches products, renders the grid.
// ============================================================

const gridEl = document.getElementById("product-grid");
const statusEl = document.getElementById("catalog-status");
const categorySelect = document.getElementById("filter-category");
const brandSelect = document.getElementById("filter-brand");
const sortSelect = document.getElementById("sort-by");

let allProducts = []; // cache the current fetch so sorting doesn't need a new query

// ---- Populate filter dropdowns ----
async function loadFilters() {
  const { data: categories, error: catError } = await supabaseClient
    .from("categories")
    .select("id, name")
    .not("parent_category_id", "is", null)
    .order("name");

  if (!catError && categories) {
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }

  const { data: brands, error: brandError } = await supabaseClient
    .from("brands")
    .select("id, name")
    .order("name");

  if (!brandError && brands) {
    brands.forEach((brand) => {
      const opt = document.createElement("option");
      opt.value = brand.id;
      opt.textContent = brand.name;
      brandSelect.appendChild(opt);
    });
  }
}

function renderSkeletons(count) {
  gridEl.innerHTML = Array.from({ length: count }).map(() => `
    <div>
      <div class="skeleton aspect-[3/4] rounded-[10px] mb-3"></div>
      <div class="skeleton h-3 w-1/2 rounded mb-2"></div>
      <div class="skeleton h-4 w-3/4 rounded mb-2"></div>
      <div class="skeleton h-4 w-1/3 rounded"></div>
    </div>
  `).join("");
}

// ---- Fetch products (re-run whenever a filter changes) ----
async function loadProducts() {
  statusEl.textContent = "Loading products…";
  renderSkeletons(8);

  let query = supabaseClient
    .from("products")
    .select(`
      id, name, mrp, selling_price, discount_percent, rating_avg, rating_count,
      brands ( name ),
      categories ( name ),
      product_images ( image_url, is_primary ),
      product_variants ( id, size, color, stock_quantity, price_override )
    `)
    .eq("is_active", true);

  const categoryId = categorySelect.value ? Number(categorySelect.value) : null;
  const brandId = brandSelect.value ? Number(brandSelect.value) : null;

  if (categoryId) query = query.eq("category_id", categoryId);
  if (brandId) query = query.eq("brand_id", brandId);

  const { data, error } = await query;

  if (error) {
    statusEl.textContent = "Couldn't load products. Check the browser console for details.";
    console.error(error);
    return;
  }

  allProducts = data || [];
  renderProducts();
}

// ---- Sort + render whatever is currently cached ----
function renderProducts() {
  let products = [...allProducts];
  const sortValue = sortSelect.value;

  if (sortValue === "price-asc") {
    products.sort((a, b) => a.selling_price - b.selling_price);
  } else if (sortValue === "price-desc") {
    products.sort((a, b) => b.selling_price - a.selling_price);
  } else if (sortValue === "rating-desc") {
    products.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  }

  if (products.length === 0) {
    statusEl.textContent = "No products match these filters.";
    gridEl.innerHTML = "";
    return;
  }

  statusEl.textContent = `${products.length} product${products.length === 1 ? "" : "s"}`;
  gridEl.innerHTML = "";

  products.forEach((product) => {
    gridEl.appendChild(buildProductCard(product));
  });
}

function buildProductCard(product) {
  const card = document.createElement("a");
  card.className = "product-card group flex flex-col";
  card.href = `product.html?id=${product.id}`;

  const primaryImage =
    (product.product_images || []).find((img) => img.is_primary) ||
    (product.product_images || [])[0];
  const imageUrl = primaryImage ? primaryImage.image_url : "https://placehold.co/500x650/e2dac8/6b6459?text=No+Image+Yet";

  const brandName = product.brands ? product.brands.name : "";
  const hasDiscount = product.discount_percent && product.discount_percent > 0;

  // Variants in stock, if this product has sizes/colors at all.
  const variants = product.product_variants || [];
  const inStockVariants = variants.filter((v) => v.stock_quantity > 0);
  const isSoldOut = variants.length > 0 && inStockVariants.length === 0;

  card.innerHTML = `
    <div class="product-card-image transition-transform duration-300 group-hover:scale-[1.015]" style="background-image: url('${imageUrl}');"></div>
    <div class="flex flex-col gap-0.5 flex-1">
      ${brandName ? `<span class="text-[0.78rem] text-indigo font-semibold">${brandName}</span>` : ""}
      <span class="font-display text-[1.05rem] leading-snug">${product.name}</span>
      <span class="flex items-baseline gap-2 mt-1 flex-wrap">
        <span class="font-semibold">₹${Number(product.selling_price).toFixed(0)}</span>
        ${hasDiscount ? `<span class="text-[0.85rem] text-[#8a8378] line-through">₹${Number(product.mrp).toFixed(0)}</span>
        <span class="badge badge-rust">${Number(product.discount_percent).toFixed(0)}% off</span>` : ""}
      </span>
      ${product.rating_count > 0 ? `<span class="text-[0.82rem] text-[#4a443c] mt-0.5">★ ${Number(product.rating_avg).toFixed(1)} (${product.rating_count})</span>` : ""}
    </div>
    <button
      type="button"
      class="quick-add-btn btn btn-primary btn-sm btn-block mt-3"
      ${isSoldOut ? "disabled" : ""}
    >${isSoldOut ? "Out of Stock" : "Add to Bag"}</button>
  `;

  const addBtn = card.querySelector(".quick-add-btn");
  addBtn.addEventListener("click", (e) => {
    // The button lives inside the whole-card <a>; stop it from
    // also navigating to the product page.
    e.preventDefault();
    e.stopPropagation();
    if (addBtn.disabled) return;

    // If the product comes in sizes/colors, default the quick-add to
    // the first in-stock variant (matches how most real storefronts
    // handle "Add to Cart" from a grid, where picking a size happens
    // on the product page but a sane default still works from here).
    const variant = inStockVariants[0] || null;

    addToCart({
      itemType: "product",
      productId: product.id,
      variantId: variant ? variant.id : null,
      name: product.name,
      imageUrl,
      color: variant ? variant.color : null,
      size: variant ? variant.size : null,
      price: variant && variant.price_override ? variant.price_override : product.selling_price,
      brand: brandName || null,
    });

    const originalText = addBtn.textContent;
    addBtn.textContent = "Added ✓";
    addBtn.disabled = true;
    setTimeout(() => {
      addBtn.textContent = originalText;
      addBtn.disabled = false;
    }, 1200);
  });

  return card;
}

// ---- Wire up events ----
categorySelect.addEventListener("change", loadProducts);
brandSelect.addEventListener("change", loadProducts);
sortSelect.addEventListener("change", renderProducts);

// ---- Init ----
loadFilters();
loadProducts();
