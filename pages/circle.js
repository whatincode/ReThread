// ============================================================
// ReThread Circle: browsable grid of upcycled_items.
// ============================================================

const statusEl = document.getElementById("circle-status");
const gridEl = document.getElementById("circle-grid");
const sourceSelect = document.getElementById("filter-source");
const sortSelect = document.getElementById("sort-by");

let allItems = [];

async function loadFilters() {
  const { data, error } = await supabaseClient
    .from("upcycled_items")
    .select("source_category");

  if (error || !data) return;

  const uniqueSources = [...new Set(data.map((row) => row.source_category))].sort();
  uniqueSources.forEach((source) => {
    const opt = document.createElement("option");
    opt.value = source;
    opt.textContent = `Recycled ${source}`;
    sourceSelect.appendChild(opt);
  });
}

function renderSkeletons() {
  gridEl.innerHTML = Array.from({ length: 8 }).map(() => `
    <div>
      <div class="skeleton aspect-[3/4] rounded-[10px] mb-3"></div>
      <div class="skeleton h-3 w-1/2 rounded mb-2"></div>
      <div class="skeleton h-4 w-3/4 rounded"></div>
    </div>
  `).join("");
}

async function loadItems() {
  statusEl.textContent = "Loading pieces…";
  renderSkeletons();

  const source = sourceSelect.value;

  function buildQuery(withRatings) {
    const fields = withRatings
      ? "id, name, description, image_url, source_category, price, rating_avg, rating_count"
      : "id, name, description, image_url, source_category, price";
    let q = supabaseClient.from("upcycled_items").select(fields);
    if (source) q = q.eq("source_category", source);
    return q;
  }

  let { data, error } = await buildQuery(true);

  if (error) {
    // rating_avg/rating_count need migration 007 — fall back without them
    // so the collection still loads instead of showing an error.
    const retry = await buildQuery(false);
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    statusEl.textContent = "Couldn't load this collection. Check the browser console for details.";
    console.error(error);
    return;
  }

  allItems = data || [];
  renderItems();
}

function renderItems() {
  let items = [...allItems];
  const sortValue = sortSelect.value;

  if (sortValue === "price-asc") {
    items.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortValue === "price-desc") {
    items.sort((a, b) => (b.price || 0) - (a.price || 0));
  }

  if (items.length === 0) {
    statusEl.textContent = "Nothing in this material yet — check back soon.";
    gridEl.innerHTML = "";
    return;
  }

  statusEl.textContent = `${items.length} piece${items.length === 1 ? "" : "s"}`;
  gridEl.innerHTML = "";

  items.forEach((item) => {
    gridEl.appendChild(buildItemCard(item));
  });
}

function buildItemCard(item) {
  const card = document.createElement("a");
  card.className = "product-card group flex flex-col";
  card.href = `circle-item.html?id=${item.id}`;

  const imageUrl = item.image_url || "https://placehold.co/500x500/e2dac8/6b6459?text=No+Image+Yet";

  card.innerHTML = `
    <div class="product-card-image transition-transform duration-300 group-hover:scale-[1.015]" style="background-image: url('${imageUrl}');"></div>
    <div class="flex flex-col gap-0.5 flex-1">
      <span class="badge badge-moss w-fit">Recycled ${item.source_category}</span>
      <span class="font-display text-[1.05rem] leading-snug mt-1">${item.name}</span>
      ${item.description ? `<span class="text-[0.82rem] text-[#4a443c]">${item.description}</span>` : ""}
      ${item.price ? `<span class="flex items-baseline gap-2 mt-1"><span class="font-semibold">₹${Number(item.price).toFixed(0)}</span></span>` : ""}
      ${item.rating_count > 0 ? `<span class="text-[0.82rem] text-[#4a443c] mt-0.5">★ ${Number(item.rating_avg).toFixed(1)} (${item.rating_count})</span>` : ""}
    </div>
    ${item.price ? `<button type="button" class="quick-add-btn btn btn-primary btn-sm btn-block mt-3">Add to Bag</button>` : ""}
  `;

  if (item.price) {
    const addBtn = card.querySelector(".quick-add-btn");
    addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      addToCart({
        itemType: "upcycled",
        productId: item.id,
        variantId: null,
        name: item.name,
        imageUrl,
        color: null,
        size: null,
        price: item.price,
        brand: "ReThread Circle",
      });

      const originalText = addBtn.textContent;
      addBtn.textContent = "Added ✓";
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.textContent = originalText;
        addBtn.disabled = false;
      }, 1200);
    });
  }

  return card;
}

sourceSelect.addEventListener("change", loadItems);
sortSelect.addEventListener("change", renderItems);

loadFilters();
loadItems();
