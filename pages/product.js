// ============================================================
// Product detail page.
// Reads ?id= from the URL, fetches everything needed to render
// the page, and wires up the color/size selectors.
// ============================================================

const statusEl = document.getElementById("product-status");
const contentEl = document.getElementById("product-content");
const skeletonEl = document.getElementById("product-skeleton");

let selectedColor = null;
let selectedSize = null;
let variants = [];
let currentProduct = null;

function getProductId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : null;
}

const PRODUCT_SELECT_FULL = `
  id, name, description, highlights, mrp, selling_price, discount_percent,
  rating_avg, rating_count, condition,
  brands ( name ),
  categories ( name ),
  product_images ( image_url, is_primary, display_order, color ),
  product_variants ( id, size, color, stock_quantity, price_override ),
  product_specifications ( spec_key, spec_value ),
  product_reviews ( customer_name, rating, review_title, review_text, created_at )
`;

// Same as above but without product_images.color — used as a fallback
// for databases that haven't run supabase-migrations/007 yet, so the
// page still works (just without the color->photo swap) instead of
// showing "Couldn't find this product."
const PRODUCT_SELECT_SAFE = `
  id, name, description, highlights, mrp, selling_price, discount_percent,
  rating_avg, rating_count, condition,
  brands ( name ),
  categories ( name ),
  product_images ( image_url, is_primary, display_order ),
  product_variants ( id, size, color, stock_quantity, price_override ),
  product_specifications ( spec_key, spec_value ),
  product_reviews ( customer_name, rating, review_title, review_text, created_at )
`;

async function fetchProductById(productId) {
  let { data, error } = await supabaseClient
    .from("products")
    .select(PRODUCT_SELECT_FULL)
    .eq("id", productId)
    .single();

  if (error) {
    // Likely product_images.color doesn't exist yet (migration 007 not run).
    // Retry without it so the page still loads.
    const retry = await supabaseClient
      .from("products")
      .select(PRODUCT_SELECT_SAFE)
      .eq("id", productId)
      .single();
    data = retry.data;
    error = retry.error;
  }

  return { data, error };
}

async function loadProduct() {
  const productId = getProductId();

  if (!productId) {
    skeletonEl.hidden = true;
    statusEl.hidden = false;
    statusEl.textContent = "No product specified. Go back to the catalog and pick an item.";
    return;
  }

  const { data: product, error } = await fetchProductById(productId);

  if (error || !product) {
    skeletonEl.hidden = true;
    statusEl.hidden = false;
    if (error && error.code !== "PGRST116") {
      // A real error (bad query, RLS, network) rather than a genuine 0-row result.
      statusEl.textContent = "Something went wrong loading this product: " + error.message;
    } else {
      statusEl.textContent = "Couldn't find this product. It may have been removed.";
    }
    console.error(error);
    return;
  }

  skeletonEl.hidden = true;
  statusEl.hidden = true;
  contentEl.hidden = false;

  currentProduct = product;

  renderGallery(product.product_images || []);
  renderInfo(product);
  renderVariants(product.product_variants || []);
  renderSpecs(product.product_specifications || []);
  renderReviews(product.product_reviews || []);
  loadUpcycledItems(product.id, product.categories ? product.categories.name : null);
  setupAddToBag();
  setupReviewForm();
}

// ---- Gallery ----
let allGalleryImages = [];

function renderGallery(images) {
  allGalleryImages = [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  showGalleryForColor(null);
}

// Redraws the gallery for a given color. If any images are tagged with
// that color, show only those (main photo switches to match the color
// the shopper just picked). If none are tagged — most products don't
// bother tagging every image — fall back to the full gallery so nothing
// breaks for products without per-color photos.
function showGalleryForColor(color) {
  const mainEl = document.getElementById("gallery-main");
  const thumbsEl = document.getElementById("gallery-thumbs");

  let list = allGalleryImages;
  if (color) {
    const matching = allGalleryImages.filter((img) => img.color === color);
    if (matching.length > 0) list = matching;
  }
  if (list.length === 0) {
    list = [{ image_url: "https://placehold.co/700x900/e2dac8/6b6459?text=No+Image+Yet" }];
  }

  function setMain(url, activeBtn) {
    mainEl.style.backgroundImage = `url('${url}')`;
    thumbsEl.querySelectorAll("button").forEach((b) => b.classList.remove("border-indigo", "border-2"));
    if (activeBtn) activeBtn.classList.add("border-indigo", "border-2");
  }

  thumbsEl.innerHTML = "";

  list.forEach((img, i) => {
    const thumb = document.createElement("button");
    thumb.className = "w-16 h-[84px] bg-cotton-dark bg-cover bg-center border border-ink/20 rounded-[6px] cursor-pointer p-0 transition-colors hover:border-indigo focus-visible:border-indigo overflow-hidden";
    thumb.style.backgroundImage = `url('${img.image_url}')`;
    thumb.addEventListener("click", () => setMain(img.image_url, thumb));
    thumbsEl.appendChild(thumb);
    if (i === 0) setMain(img.image_url, thumb);
  });
}

// ---- Core info ----
function renderInfo(product) {
  document.getElementById("product-brand").textContent = product.brands ? product.brands.name : "";
  document.getElementById("product-name").textContent = product.name;

  const ratingEl = document.getElementById("product-rating");
  if (product.rating_count > 0) {
    ratingEl.textContent = `★ ${Number(product.rating_avg).toFixed(1)} (${product.rating_count} reviews)`;
  } else {
    ratingEl.textContent = "No reviews yet";
  }

  const priceEl = document.getElementById("product-price");
  const hasDiscount = product.discount_percent && product.discount_percent > 0;
  priceEl.innerHTML = `
    <span class="text-[1.5rem] font-semibold">₹${Number(product.selling_price).toFixed(0)}</span>
    ${hasDiscount ? `
      <span class="text-[0.85rem] text-[#8a8378] line-through">₹${Number(product.mrp).toFixed(0)}</span>
      <span class="badge badge-rust">${Number(product.discount_percent).toFixed(0)}% off</span>
    ` : ""}
  `;

  const highlightsEl = document.getElementById("product-highlights");
  if (product.highlights) {
    const lines = product.highlights.split("\n").filter(Boolean);
    highlightsEl.innerHTML = `<ul class="pl-[1.1rem] mb-3">${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
  }

  if (product.description) {
    const desc = document.createElement("p");
    desc.className = "text-[#4a443c]";
    desc.textContent = product.description;
    highlightsEl.appendChild(desc);
  }
}

// ---- Variants (color + size) ----
function renderVariants(productVariants) {
  variants = productVariants;
  const colorsEl = document.getElementById("product-colors");
  const sizesEl = document.getElementById("product-sizes");
  const noteEl = document.getElementById("variant-note");

  if (variants.length === 0) {
    colorsEl.innerHTML = "";
    sizesEl.innerHTML = "";
    noteEl.textContent = "";
    refreshAddToBagState();
    return;
  }

  const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];

  // Only ask the shopper to choose whichever dimension actually varies.
  // A product available in a single color only shouldn't block "Add to
  // Bag" on a color choice that doesn't exist — same for size.
  selectedColor = colors.length > 0 ? colors[0] : null;
  selectedSize = sizes.length === 1 ? sizes[0] : null;

  const labelClass = "block w-full text-[0.8rem] font-semibold mt-4 mb-2";

  function draw() {
    colorsEl.innerHTML = colors.length
      ? `<span class="${labelClass}">Color</span>` +
        colors.map((c) => `<button class="chip ${c === selectedColor ? "is-selected" : ""}" data-color="${c}">${c}</button>`).join("")
      : "";

    const availableSizesForColor = selectedColor
      ? [...new Set(variants.filter((v) => v.color === selectedColor).map((v) => v.size))]
      : sizes;

    sizesEl.innerHTML = sizes.length
      ? `<span class="${labelClass}">Size</span>` +
        sizes.map((s) => {
          const available = availableSizesForColor.includes(s);
          return `<button class="chip ${s === selectedSize ? "is-selected" : ""}" data-size="${s}" ${available ? "" : "disabled"}>${s}</button>`;
        }).join("")
      : "";

    updateStockNote();

    colorsEl.querySelectorAll("[data-color]").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedColor = btn.dataset.color;
        // Re-selecting a size only makes sense if more than one exists —
        // otherwise keep the single size auto-selected (see renderVariants).
        selectedSize = sizes.length === 1 ? sizes[0] : null;
        draw();
        showGalleryForColor(selectedColor);
      });
    });
    sizesEl.querySelectorAll("[data-size]:not(:disabled)").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedSize = btn.dataset.size;
        draw();
      });
    });
  }

  function updateStockNote() {
    const colorRequired = colors.length > 0;
    const sizeRequired = sizes.length > 0;

    if ((colorRequired && !selectedColor) || (sizeRequired && !selectedSize)) {
      const missing = [colorRequired && !selectedColor ? "color" : null, sizeRequired && !selectedSize ? "size" : null].filter(Boolean);
      noteEl.textContent = `Select a ${missing.join(" and ")}.`;
      refreshAddToBagState();
      return;
    }
    const match = variants.find((v) =>
      (!colorRequired || v.color === selectedColor) && (!sizeRequired || v.size === selectedSize)
    );
    if (!match) {
      noteEl.textContent = "";
    } else if (match.stock_quantity <= 0) {
      noteEl.textContent = "Out of stock in this combination.";
    } else if (match.stock_quantity <= 5) {
      noteEl.textContent = `Only ${match.stock_quantity} left.`;
    } else {
      noteEl.textContent = "In stock.";
    }
    refreshAddToBagState();
  }

  draw();
  showGalleryForColor(selectedColor);
}

// ---- Specifications ----
function renderSpecs(specs) {
  const listEl = document.getElementById("spec-list");
  if (specs.length === 0) {
    listEl.closest("section").hidden = true;
    return;
  }
  listEl.innerHTML = specs.map((s) => `<dt class="font-semibold text-[#4a443c]">${s.spec_key}</dt><dd class="m-0">${s.spec_value}</dd>`).join("");
}

// ---- Reviews ----
function renderReviews(reviews) {
  const listEl = document.getElementById("review-list");
  if (reviews.length === 0) {
    listEl.innerHTML = `<p class="text-[#6b6459] text-[0.9rem]">No reviews yet — be the first once purchases are live.</p>`;
    return;
  }

  const sorted = [...reviews].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  listEl.innerHTML = sorted.map((r) => `
    <div>
      <div class="flex gap-3 items-baseline">
        <span class="text-rust tracking-wide">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</span>
        <span class="text-[0.85rem] text-[#6b6459]">${r.customer_name}</span>
      </div>
      ${r.review_title ? `<p class="font-semibold mt-1.5 mb-1">${r.review_title}</p>` : ""}
      ${r.review_text ? `<p class="m-0 text-[#3a352e]">${r.review_text}</p>` : ""}
    </div>
  `).join("");
}

// ---- Write a review ----
async function setupReviewForm() {
  const signedOutEl = document.getElementById("review-form-signed-out");
  const formEl = document.getElementById("review-form");
  if (!formEl) return;

  const { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    signedOutEl.hidden = false;
    formEl.hidden = true;
    return;
  }

  signedOutEl.hidden = true;
  formEl.hidden = false;

  const statusEl = document.getElementById("review-form-status");
  const submitBtn = document.getElementById("review-submit-btn");

  function setStatus(message, kind) {
    if (!message) { statusEl.innerHTML = ""; return; }
    const cls = kind === "error" ? "banner banner-error" : "banner banner-success";
    statusEl.innerHTML = `<div class="${cls}">${message}</div>`;
  }

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = Number(document.getElementById("review-rating").value);
    const title = document.getElementById("review-title").value.trim();
    const text = document.getElementById("review-text").value.trim();

    if (!rating) {
      setStatus("Please choose a rating.", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";
    setStatus("");

    const customerName =
      (user.user_metadata && user.user_metadata.full_name) ||
      (user.email ? user.email.split("@")[0] : "Customer");

    const { error } = await supabaseClient.from("product_reviews").insert({
      product_id: currentProduct.id,
      customer_id: user.id,
      customer_name: customerName,
      rating,
      review_title: title || null,
      review_text: text || null,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = "Submit Review";

    if (error) {
      setStatus("Couldn't submit your review: " + error.message, "error");
      return;
    }

    setStatus("Thanks — your review is live.", "success");
    formEl.reset();
    // Re-fetch just the reviews so the new one (and updated rating) show up.
    const { data: refreshed } = await supabaseClient
      .from("products")
      .select("rating_avg, rating_count, product_reviews ( customer_name, rating, review_title, review_text, created_at )")
      .eq("id", currentProduct.id)
      .single();
    if (refreshed) {
      currentProduct.rating_avg = refreshed.rating_avg;
      currentProduct.rating_count = refreshed.rating_count;
      renderInfo(currentProduct);
      renderReviews(refreshed.product_reviews || []);
    }
  });
}

// ---- Upcycling gallery: explicit links first, fallback to category match ----
async function loadUpcycledItems(productId, categoryName) {
  const sectionEl = document.getElementById("upcycle-section");
  const gridEl = document.getElementById("upcycle-grid");

  const { data: linked, error: linkError } = await supabaseClient
    .from("product_upcycle_links")
    .select("upcycled_items ( id, name, description, image_url, price )")
    .eq("product_id", productId);

  let items = [];

  if (!linkError && linked && linked.length > 0) {
    items = linked.map((row) => row.upcycled_items).filter(Boolean);
  } else if (categoryName) {
    const { data: fallback, error: fallbackError } = await supabaseClient
      .from("upcycled_items")
      .select("id, name, description, image_url, price")
      .eq("source_category", categoryName);

    if (!fallbackError && fallback) {
      items = fallback;
    }
  }

  if (items.length === 0) {
    sectionEl.hidden = true;
    return;
  }

  sectionEl.hidden = false;
  gridEl.innerHTML = items.map((item) => `
    <a href="${item.id ? `circle-item.html?id=${item.id}` : "#"}" class="flex flex-col gap-1 group">
      <div class="aspect-square bg-cotton-dark bg-cover bg-center rounded-lg border border-ink/10 mb-1.5 transition-transform duration-300 group-hover:scale-[1.015]" style="background-image: url('${item.image_url || "https://placehold.co/400x400/e2dac8/6b6459?text=No+Image"}');"></div>
      <span class="font-semibold text-[0.95rem]">${item.name}</span>
      ${item.description ? `<span class="text-[0.82rem] text-[#4a443c]">${item.description}</span>` : ""}
      ${item.price ? `<span class="text-[0.85rem] font-semibold text-moss">₹${Number(item.price).toFixed(0)}</span>` : ""}
    </a>
  `).join("");
}

// ---- Add to Bag ----
function getSelectedVariant() {
  if (variants.length === 0) return null;

  const colorRequired = variants.some((v) => v.color);
  const sizeRequired = variants.some((v) => v.size);

  if ((colorRequired && !selectedColor) || (sizeRequired && !selectedSize)) {
    return undefined; // undefined = incomplete selection
  }
  return variants.find((v) =>
    (!colorRequired || v.color === selectedColor) && (!sizeRequired || v.size === selectedSize)
  ) || undefined;
}

function refreshAddToBagState() {
  const btn = document.getElementById("add-to-bag-btn");
  if (!btn || !currentProduct) return;

  if (variants.length === 0) {
    btn.disabled = false;
    btn.textContent = "Add to Bag";
    return;
  }

  const variant = getSelectedVariant();
  if (!variant) {
    btn.disabled = true;
    btn.textContent = "Add to Bag";
  } else if (variant.stock_quantity <= 0) {
    btn.disabled = true;
    btn.textContent = "Out of Stock";
  } else {
    btn.disabled = false;
    btn.textContent = "Add to Bag";
  }
}

function setupAddToBag() {
  const btn = document.getElementById("add-to-bag-btn");
  if (!btn) return;

  refreshAddToBagState();

  btn.addEventListener("click", () => {
    const variant = variants.length > 0 ? getSelectedVariant() : null;
    if (variants.length > 0 && (!variant || variant.stock_quantity <= 0)) return;

    const images = currentProduct.product_images || [];
    const primary = images.find((i) => i.is_primary) || images[0];

    addToCart({
      itemType: "product",
      productId: currentProduct.id,
      variantId: variant ? variant.id : null,
      name: currentProduct.name,
      imageUrl: primary ? primary.image_url : null,
      color: variant ? variant.color : null,
      size: variant ? variant.size : null,
      price: variant && variant.price_override ? variant.price_override : currentProduct.selling_price,
      brand: currentProduct.brands ? currentProduct.brands.name : null,
    });

    btn.textContent = "Added ✓";
    setTimeout(() => {
      refreshAddToBagState();
    }, 1200);
  });
}

loadProduct();
