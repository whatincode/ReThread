// ============================================================
// Brand Portal: lets a brand's linked staff account add and
// manage products for their own brand only.
//
// Access is gated by the `brand_members` table (see
// supabase-migrations/002_brand_portal.sql). A user must be
// linked to at least one brand to see the dashboard.
// ============================================================

const loadingEl = document.getElementById("portal-loading");
const signedOutEl = document.getElementById("portal-signed-out");
const noBrandEl = document.getElementById("portal-no-brand");
const dashboardEl = document.getElementById("portal-dashboard");

const brandSwitcherWrap = document.getElementById("brand-switcher-wrap");
const brandSwitcher = document.getElementById("brand-switcher");
const brandNameStatic = document.getElementById("brand-name-static");

const productsStatusEl = document.getElementById("products-status");
const productsListEl = document.getElementById("products-list");

const fulfillmentStatsEl = document.getElementById("fulfillment-stats");
const fulfillmentStatusEl = document.getElementById("fulfillment-status");
const fulfillmentListEl = document.getElementById("fulfillment-list");

const FULFILLMENT_STAGES = [
  { key: "ordered", label: "Ordered" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

const newProductBtn = document.getElementById("new-product-btn");
const closeFormBtn = document.getElementById("close-form-btn");
const newProductSection = document.getElementById("new-product-section");
const productForm = document.getElementById("product-form");
const productSubmitBtn = document.getElementById("product-submit-btn");
const productFormStatus = document.getElementById("product-form-status");

const categorySelect = document.getElementById("p-category");
const mrpInput = document.getElementById("p-mrp");
const priceInput = document.getElementById("p-price");
const discountPreview = document.getElementById("discount-preview");

const imageListEl = document.getElementById("image-list");
const imageFileInput = document.getElementById("image-file-input");
const imageUrlInput = document.getElementById("image-url-input");
const addImageUrlBtn = document.getElementById("add-image-url-btn");
const imageUploadStatus = document.getElementById("image-upload-status");

const variantRowsEl = document.getElementById("variant-rows");
const addVariantBtn = document.getElementById("add-variant-btn");
const specRowsEl = document.getElementById("spec-rows");
const addSpecBtn = document.getElementById("add-spec-btn");

let brands = [];
let currentBrandId = null;
let images = []; // { url, isPrimary }

function showGateState(state) {
  loadingEl.hidden = state !== "loading";
  signedOutEl.hidden = state !== "signed-out";
  noBrandEl.hidden = state !== "no-brand";
  dashboardEl.hidden = state !== "dashboard";
}

function setStatus(el, message, kind) {
  if (!message) { el.innerHTML = ""; return; }
  const cls = kind === "error" ? "banner banner-error" : kind === "success" ? "banner banner-success" : "banner banner-info";
  el.innerHTML = `<div class="${cls}">${message}</div>`;
}

// ---- Bootstrap: figure out who's signed in and which brand(s) they manage ----
async function init() {
  showGateState("loading");

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    showGateState("signed-out");
    return;
  }

  const { data: memberships, error } = await supabaseClient
    .from("brand_members")
    .select("brand_id, role, brands ( id, name )")
    .eq("user_id", user.id);

  if (error || !memberships || memberships.length === 0) {
    showGateState("no-brand");
    return;
  }

  brands = memberships.map((m) => m.brands).filter(Boolean);

  if (brands.length > 1) {
    brandSwitcherWrap.hidden = false;
    brandSwitcher.innerHTML = brands.map((b) => `<option value="${b.id}">${b.name}</option>`).join("");
    brandSwitcher.addEventListener("change", () => {
      currentBrandId = Number(brandSwitcher.value);
      loadProducts();
    });
    currentBrandId = brands[0].id;
  } else {
    brandNameStatic.hidden = false;
    brandNameStatic.textContent = brands[0].name;
    currentBrandId = brands[0].id;
  }

  showGateState("dashboard");
  loadCategories();
  loadProducts();
  loadFulfillment();
}

// ---- Category dropdown ----
async function loadCategories() {
  const { data, error } = await supabaseClient
    .from("categories")
    .select("id, name")
    .not("parent_category_id", "is", null)
    .order("name");

  if (!error && data) {
    data.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.id;
      opt.textContent = cat.name;
      categorySelect.appendChild(opt);
    });
  }
}

// ---- Existing products list ----
async function loadProducts() {
  productsStatusEl.textContent = "Loading…";
  productsListEl.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("products")
    .select(`
      id, name, selling_price, mrp, is_active,
      product_images ( image_url, is_primary ),
      product_variants ( stock_quantity ),
      order_items ( quantity, orders ( status ) )
    `)
    .eq("brand_id", currentBrandId)
    .order("id", { ascending: false });

  if (error) {
    productsStatusEl.textContent = "Couldn't load your products. Check the browser console for details.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    productsStatusEl.textContent = "You haven't added any products yet.";
    return;
  }

  productsStatusEl.textContent = `${data.length} product${data.length === 1 ? "" : "s"}`;

  productsListEl.innerHTML = data.map((p) => {
    const img = (p.product_images || []).find((i) => i.is_primary) || (p.product_images || [])[0];
    const imgUrl = img ? img.image_url : "https://placehold.co/120x150/e2dac8/6b6459?text=No+Image";

    const stock = (p.product_variants || []).reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
    const sold = (p.order_items || [])
      .filter((oi) => oi.orders && oi.orders.status === "paid")
      .reduce((sum, oi) => sum + (oi.quantity || 0), 0);
    const hasVariants = (p.product_variants || []).length > 0;

    return `
      <div class="surface-card rounded-xl p-4 flex flex-wrap items-center gap-4" data-product-id="${p.id}">
        <div class="w-14 h-[70px] bg-cover bg-center rounded-md border border-ink/10 shrink-0" style="background-image: url('${imgUrl}');"></div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold truncate m-0">${p.name}</p>
          <p class="text-[0.85rem] text-[#6b6459] m-0">₹${Number(p.selling_price).toFixed(0)}${p.mrp && p.mrp > p.selling_price ? ` <span class="line-through">₹${Number(p.mrp).toFixed(0)}</span>` : ""}</p>
        </div>
        <span class="badge badge-indigo" title="Units sold across paid orders">${sold} sold${hasVariants ? ` / ${stock} in stock` : ""}</span>
        <span class="badge ${p.is_active ? "badge-moss" : "badge-muted"}">${p.is_active ? "Live" : "Hidden"}</span>
        <button type="button" class="btn-ghost btn-sm rounded-md toggle-active-btn" data-active="${p.is_active}">${p.is_active ? "Hide" : "Publish"}</button>
      </div>
    `;
  }).join("");

  productsListEl.querySelectorAll(".toggle-active-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("[data-product-id]");
      const productId = Number(row.dataset.productId);
      const isActive = btn.dataset.active === "true";
      btn.disabled = true;
      const { error } = await supabaseClient.from("products").update({ is_active: !isActive }).eq("id", productId);
      btn.disabled = false;
      if (!error) loadProducts();
    });
  });
}

// ---- Orders & fulfillment tracking ----
// Shows every sold line item for this brand's products (from paid
// orders only) with a 4-stage interactive tracker: ordered → shipped
// → out for delivery → delivered. Brand staff can click any stage to
// move an item to it (see supabase-migrations/008_order_fulfillment.sql
// for the column + RLS policies backing this).
async function loadFulfillment() {
  fulfillmentStatusEl.textContent = "Loading…";
  fulfillmentListEl.innerHTML = "";
  fulfillmentStatsEl.hidden = true;

  const { data, error } = await supabaseClient
    .from("order_items")
    .select(`
      id, product_name, quantity, fulfillment_status,
      products!inner ( brand_id ),
      orders!inner ( id, created_at, status, shipping_name, shipping_city )
    `)
    .eq("products.brand_id", currentBrandId)
    .eq("orders.status", "paid")
    .order("id", { ascending: false });

  if (error) {
    fulfillmentStatusEl.textContent = "Couldn't load your orders. Check the browser console for details.";
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    fulfillmentStatusEl.textContent = "No paid orders yet for your products.";
    return;
  }

  // ---- Stats ----
  const counts = { total: 0, ordered: 0, shipped: 0, out_for_delivery: 0, delivered: 0 };
  data.forEach((item) => {
    counts.total += item.quantity || 0;
    const stage = FULFILLMENT_STAGES.some((s) => s.key === item.fulfillment_status) ? item.fulfillment_status : "ordered";
    counts[stage] += item.quantity || 0;
  });
  document.getElementById("stat-sold").textContent = counts.total;
  document.getElementById("stat-ordered").textContent = counts.ordered;
  document.getElementById("stat-shipped").textContent = counts.shipped;
  document.getElementById("stat-out").textContent = counts.out_for_delivery;
  document.getElementById("stat-delivered").textContent = counts.delivered;
  fulfillmentStatsEl.hidden = false;

  fulfillmentStatusEl.textContent = `${data.length} line item${data.length === 1 ? "" : "s"} across your paid orders`;

  fulfillmentListEl.innerHTML = data.map((item) => {
    const currentIndex = Math.max(0, FULFILLMENT_STAGES.findIndex((s) => s.key === item.fulfillment_status));
    const order = item.orders || {};
    const location = [order.shipping_name, order.shipping_city].filter(Boolean).join(" · ");

    const steps = FULFILLMENT_STAGES.map((stage, i) => {
      const state = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
      const dotCls = state === "upcoming" ? "bg-ink/15 text-[#8a8378]" : "bg-rust text-cotton";
      const lineCls = i < currentIndex ? "bg-rust" : "bg-ink/15";
      return `
        <div class="flex-1 flex items-center">
          <button type="button"
            class="fulfillment-step flex flex-col items-center gap-1.5 group cursor-pointer bg-transparent border-0 p-0"
            data-item-id="${item.id}" data-stage="${stage.key}" title="Mark as ${stage.label}">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[0.7rem] font-semibold transition ${dotCls} ${state === "current" ? "ring-2 ring-rust/30 ring-offset-2 ring-offset-cotton" : ""}">
              ${state === "done" ? "✓" : i + 1}
            </span>
            <span class="text-[0.7rem] whitespace-nowrap ${state === "upcoming" ? "text-[#8a8378]" : "font-semibold text-ink"}">${stage.label}</span>
          </button>
          ${i < FULFILLMENT_STAGES.length - 1 ? `<span class="h-0.5 flex-1 mx-1 mb-4 ${lineCls}"></span>` : ""}
        </div>
      `;
    }).join("");

    return `
      <div class="surface-card rounded-xl p-4 sm:p-5 flex flex-col gap-4" data-fulfillment-row="${item.id}">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="font-semibold m-0">${item.product_name} <span class="text-[#6b6459] font-normal">× ${item.quantity}</span></p>
            <p class="text-[0.8rem] text-[#6b6459] m-0">Order #${order.id}${location ? ` · ${location}` : ""} · ${order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}</p>
          </div>
          <span class="fulfillment-status-note text-[0.78rem] min-h-[1.2em]"></span>
        </div>
        <div class="flex items-start">${steps}</div>
      </div>
    `;
  }).join("");

  fulfillmentListEl.querySelectorAll(".fulfillment-step").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const itemId = Number(btn.dataset.itemId);
      const stage = btn.dataset.stage;
      const row = fulfillmentListEl.querySelector(`[data-fulfillment-row="${itemId}"]`);
      const note = row.querySelector(".fulfillment-status-note");
      note.textContent = "Saving…";

      const { error } = await supabaseClient
        .from("order_items")
        .update({ fulfillment_status: stage, fulfillment_updated_at: new Date().toISOString() })
        .eq("id", itemId);

      if (error) {
        note.textContent = "Couldn't update — try again.";
        console.error(error);
        return;
      }
      loadFulfillment();
    });
  });
}

// ---- Add-product form open/close ----
newProductBtn.addEventListener("click", () => {
  newProductSection.hidden = false;
  newProductSection.scrollIntoView({ behavior: "smooth", block: "start" });
});
closeFormBtn.addEventListener("click", () => {
  newProductSection.hidden = true;
});

// ---- Discount preview ----
function updateDiscountPreview() {
  const mrp = Number(mrpInput.value);
  const price = Number(priceInput.value);
  if (mrp > 0 && price > 0 && mrp > price) {
    const pct = ((mrp - price) / mrp) * 100;
    discountPreview.textContent = `${pct.toFixed(0)}% off MRP`;
  } else {
    discountPreview.textContent = "";
  }
}
mrpInput.addEventListener("input", updateDiscountPreview);
priceInput.addEventListener("input", updateDiscountPreview);

// ---- Images ----
function renderImages() {
  imageListEl.innerHTML = images.map((img, i) => `
    <div class="relative w-20 h-24 rounded-md overflow-hidden border-2 ${img.isPrimary ? "border-indigo" : "border-ink/15"} bg-cover bg-center" style="background-image:url('${img.url}')">
      <button type="button" class="absolute top-0.5 right-0.5 w-5 h-5 bg-ink/70 text-cotton text-[0.7rem] rounded-full leading-none" data-remove="${i}" title="Remove">✕</button>
      ${img.isPrimary ? `<span class="absolute bottom-0.5 left-0.5 badge badge-indigo text-[0.6rem] px-1.5 py-0.5">Primary</span>`
        : `<button type="button" class="absolute bottom-0.5 left-0.5 text-[0.65rem] bg-cotton/90 px-1.5 py-0.5 rounded" data-primary="${i}">Set primary</button>`}
    </div>
  `).join("");

  imageListEl.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      images.splice(Number(btn.dataset.remove), 1);
      if (images.length && !images.some((i) => i.isPrimary)) images[0].isPrimary = true;
      renderImages();
    });
  });
  imageListEl.querySelectorAll("[data-primary]").forEach((btn) => {
    btn.addEventListener("click", () => {
      images.forEach((img, i) => (img.isPrimary = i === Number(btn.dataset.primary)));
      renderImages();
    });
  });
}

addImageUrlBtn.addEventListener("click", () => {
  const url = imageUrlInput.value.trim();
  if (!url) return;
  images.push({ url, isPrimary: images.length === 0 });
  imageUrlInput.value = "";
  renderImages();
});

imageFileInput.addEventListener("change", async () => {
  const file = imageFileInput.files[0];
  if (!file) return;

  imageUploadStatus.textContent = "Uploading…";
  const path = `${currentBrandId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error: uploadError } = await supabaseClient.storage.from("product-images").upload(path, file);
  if (uploadError) {
    imageUploadStatus.textContent = "Upload failed — make sure the 'product-images' storage bucket exists (see supabase-migrations/002_brand_portal.sql).";
    console.error(uploadError);
    return;
  }

  const { data: publicUrlData } = supabaseClient.storage.from("product-images").getPublicUrl(path);
  images.push({ url: publicUrlData.publicUrl, isPrimary: images.length === 0 });
  imageUploadStatus.textContent = "";
  imageFileInput.value = "";
  renderImages();
});

// ---- Variant rows (size / color / stock) ----
function addVariantRow() {
  const row = document.createElement("div");
  row.className = "grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center";
  row.innerHTML = `
    <input placeholder="Size (e.g. M)" class="field-input variant-size" />
    <input placeholder="Color (e.g. Rust)" class="field-input variant-color" />
    <input type="number" min="0" placeholder="Stock" class="field-input variant-stock" />
    <button type="button" class="btn-danger-ghost rounded-md" title="Remove row">✕</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  variantRowsEl.appendChild(row);
}
addVariantBtn.addEventListener("click", addVariantRow);

// ---- Spec rows (key / value) ----
function addSpecRow() {
  const row = document.createElement("div");
  row.className = "grid grid-cols-[1fr_1fr_auto] gap-2 items-center";
  row.innerHTML = `
    <input placeholder="e.g. Fabric" class="field-input spec-key" />
    <input placeholder="e.g. 100% Cotton" class="field-input spec-value" />
    <button type="button" class="btn-danger-ghost rounded-md" title="Remove row">✕</button>
  `;
  row.querySelector("button").addEventListener("click", () => row.remove());
  specRowsEl.appendChild(row);
}
addSpecBtn.addEventListener("click", addSpecRow);

// ---- Submit new product ----
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus(productFormStatus, "");

  if (images.length === 0) {
    setStatus(productFormStatus, "Add at least one product image before publishing.", "error");
    return;
  }

  const mrp = Number(mrpInput.value);
  const sellingPrice = Number(priceInput.value);
  const discountPercent = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  productSubmitBtn.disabled = true;
  productSubmitBtn.innerHTML = `<span class="spinner"></span> Publishing…`;

  const { data: product, error: productError } = await supabaseClient
    .from("products")
    .insert([{
      name: document.getElementById("p-name").value.trim(),
      description: document.getElementById("p-description").value.trim() || null,
      highlights: document.getElementById("p-highlights").value.trim() || null,
      category_id: Number(categorySelect.value),
      condition: document.getElementById("p-condition").value,
      mrp,
      selling_price: sellingPrice,
      discount_percent: discountPercent,
      brand_id: currentBrandId,
      is_active: true,
    }])
    .select()
    .single();

  if (productError || !product) {
    productSubmitBtn.disabled = false;
    productSubmitBtn.textContent = "Publish Product";
    setStatus(productFormStatus, "Couldn't save this product. " + (productError ? productError.message : ""), "error");
    console.error(productError);
    return;
  }

  const imageRows = images.map((img, i) => ({
    product_id: product.id,
    image_url: img.url,
    is_primary: img.isPrimary,
    display_order: i,
  }));
  await supabaseClient.from("product_images").insert(imageRows);

  const variantRows = [...variantRowsEl.querySelectorAll(":scope > div")]
    .map((row) => ({
      product_id: product.id,
      size: row.querySelector(".variant-size").value.trim() || null,
      color: row.querySelector(".variant-color").value.trim() || null,
      stock_quantity: Number(row.querySelector(".variant-stock").value) || 0,
    }))
    .filter((v) => v.size || v.color);
  if (variantRows.length > 0) await supabaseClient.from("product_variants").insert(variantRows);

  const specRows = [...specRowsEl.querySelectorAll(":scope > div")]
    .map((row) => ({
      product_id: product.id,
      spec_key: row.querySelector(".spec-key").value.trim(),
      spec_value: row.querySelector(".spec-value").value.trim(),
    }))
    .filter((s) => s.spec_key && s.spec_value);
  if (specRows.length > 0) await supabaseClient.from("product_specifications").insert(specRows);

  productSubmitBtn.disabled = false;
  productSubmitBtn.textContent = "Publish Product";
  setStatus(productFormStatus, "Product published! It's now live in the catalog.", "success");

  productForm.reset();
  images = [];
  renderImages();
  variantRowsEl.innerHTML = "";
  specRowsEl.innerHTML = "";
  discountPreview.textContent = "";
  loadProducts();

  setTimeout(() => { newProductSection.hidden = true; setStatus(productFormStatus, ""); }, 1600);
});

// Start with one empty variant + spec row for convenience
addVariantRow();
addSpecRow();

init();
