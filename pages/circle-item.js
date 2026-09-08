// ============================================================
// ReThread Circle item detail page.
// Reads ?id= from the URL and renders a single upcycled_items row
// the same way product.js renders a catalog product — image,
// price, an Add to Bag button, and reviews. Circle pieces have no
// color/size variants, so there's no chip selector here.
// ============================================================

const statusEl = document.getElementById("item-status");
const contentEl = document.getElementById("item-content");
const skeletonEl = document.getElementById("item-skeleton");

let currentItem = null;

function getItemId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  return id ? Number(id) : null;
}

async function fetchItemById(itemId) {
  // Try the full select (needs migration 007: rating_avg/rating_count on
  // upcycled_items, and reviews linked via upcycled_item_id). Fall back to
  // a bare-bones select if that migration hasn't been run yet, so the page
  // still works — just without ratings/reviews until it is.
  let { data, error } = await supabaseClient
    .from("upcycled_items")
    .select("id, name, description, image_url, source_category, price, rating_avg, rating_count, product_reviews ( customer_name, rating, review_title, review_text, created_at )")
    .eq("id", itemId)
    .single();

  if (error) {
    const retry = await supabaseClient
      .from("upcycled_items")
      .select("id, name, description, image_url, source_category, price")
      .eq("id", itemId)
      .single();
    if (retry.data) retry.data.product_reviews = [];
    data = retry.data;
    error = retry.error;
  }

  return { data, error };
}

async function loadItem() {
  const itemId = getItemId();

  if (!itemId) {
    skeletonEl.hidden = true;
    statusEl.hidden = false;
    statusEl.textContent = "No piece specified. Go back to ReThread Circle and pick one.";
    return;
  }

  const { data: item, error } = await fetchItemById(itemId);

  if (error || !item) {
    skeletonEl.hidden = true;
    statusEl.hidden = false;
    if (error && error.code !== "PGRST116") {
      statusEl.textContent = "Something went wrong loading this piece: " + error.message;
    } else {
      statusEl.textContent = "Couldn't find this piece. It may have been claimed or removed.";
    }
    console.error(error);
    return;
  }

  skeletonEl.hidden = true;
  statusEl.hidden = true;
  contentEl.hidden = false;

  currentItem = item;

  renderInfo(item);
  renderReviews(item.product_reviews || []);
  setupAddToBag();
  setupReviewForm();
}

function renderInfo(item) {
  const imageUrl = item.image_url || "https://placehold.co/700x700/e2dac8/6b6459?text=No+Image+Yet";
  document.getElementById("item-image").style.backgroundImage = `url('${imageUrl}')`;

  document.getElementById("item-source").textContent = `Recycled ${item.source_category}`;
  document.getElementById("item-name").textContent = item.name;

  const ratingEl = document.getElementById("item-rating");
  if (item.rating_count > 0) {
    ratingEl.textContent = `★ ${Number(item.rating_avg).toFixed(1)} (${item.rating_count} reviews)`;
  } else {
    ratingEl.textContent = "No reviews yet";
  }

  const priceEl = document.getElementById("item-price");
  priceEl.innerHTML = item.price
    ? `<span class="text-[1.5rem] font-semibold">₹${Number(item.price).toFixed(0)}</span>`
    : "";

  const descEl = document.getElementById("item-description");
  descEl.innerHTML = item.description ? `<p class="m-0">${item.description}</p>` : "";
}

// ---- Reviews (shared markup/logic with product.js) ----
function renderReviews(reviews) {
  const listEl = document.getElementById("review-list");
  if (reviews.length === 0) {
    listEl.innerHTML = `<p class="text-[#6b6459] text-[0.9rem]">No reviews yet — be the first.</p>`;
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

  const statusMsgEl = document.getElementById("review-form-status");
  const submitBtn = document.getElementById("review-submit-btn");

  function setStatus(message, kind) {
    if (!message) { statusMsgEl.innerHTML = ""; return; }
    const cls = kind === "error" ? "banner banner-error" : "banner banner-success";
    statusMsgEl.innerHTML = `<div class="${cls}">${message}</div>`;
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
      upcycled_item_id: currentItem.id,
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

    const { data: refreshed } = await supabaseClient
      .from("upcycled_items")
      .select("rating_avg, rating_count, product_reviews ( customer_name, rating, review_title, review_text, created_at )")
      .eq("id", currentItem.id)
      .single();
    if (refreshed) {
      currentItem.rating_avg = refreshed.rating_avg;
      currentItem.rating_count = refreshed.rating_count;
      renderInfo(currentItem);
      renderReviews(refreshed.product_reviews || []);
    }
  });
}

// ---- Add to Bag ----
function setupAddToBag() {
  const btn = document.getElementById("add-to-bag-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    addToCart({
      itemType: "upcycled",
      productId: currentItem.id,
      variantId: null,
      name: currentItem.name,
      imageUrl: currentItem.image_url,
      color: null,
      size: null,
      price: currentItem.price || 0,
      brand: "ReThread Circle",
    });

    btn.textContent = "Added ✓";
    setTimeout(() => {
      btn.textContent = "Add to Bag";
    }, 1200);
  });
}

loadItem();
