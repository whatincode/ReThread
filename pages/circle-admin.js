// ============================================================
// Circle Admin: lets ReThread staff (brand_members of 'ReThread
// Label' — see supabase-migrations/009_circle_admin.sql) upload
// or replace the photo on any ReThread Circle piece
// (public.upcycled_items).
// ============================================================

const loadingEl = document.getElementById("admin-loading");
const signedOutEl = document.getElementById("admin-signed-out");
const noAccessEl = document.getElementById("admin-no-access");
const dashboardEl = document.getElementById("admin-dashboard");

const itemsStatusEl = document.getElementById("items-status");
const itemsListEl = document.getElementById("items-list");

function showGateState(state) {
  loadingEl.hidden = state !== "loading";
  signedOutEl.hidden = state !== "signed-out";
  noAccessEl.hidden = state !== "no-access";
  dashboardEl.hidden = state !== "dashboard";
}

// ---- Bootstrap: is anyone signed in, and are they ReThread staff? ----
async function init() {
  showGateState("loading");

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) {
    showGateState("signed-out");
    return;
  }

  const { data: memberships, error } = await supabaseClient
    .from("brand_members")
    .select("brand_id, brands ( name )")
    .eq("user_id", user.id);

  const isStaff = !error && memberships && memberships.some((m) => m.brands && m.brands.name === "ReThread Label");

  if (!isStaff) {
    showGateState("no-access");
    return;
  }

  showGateState("dashboard");
  loadItems();
}

// ---- Load every Circle piece and render an editable row for each ----
async function loadItems() {
  itemsStatusEl.textContent = "Loading…";
  itemsListEl.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("upcycled_items")
    .select("id, name, image_url, source_category, price")
    .order("name");

  if (error) {
    itemsStatusEl.textContent = "Couldn't load Circle pieces. Check the browser console for details.";
    console.error(error);
    return;
  }

  const items = data || [];
  itemsStatusEl.textContent = `${items.length} piece${items.length === 1 ? "" : "s"}`;
  items.forEach((item) => itemsListEl.appendChild(buildItemRow(item)));
}

function buildItemRow(item) {
  const row = document.createElement("div");
  row.className = "panel p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center";

  const thumbUrl = item.image_url || "https://placehold.co/200x200/e2dac8/6b6459?text=No+Image+Yet";

  row.innerHTML = `
    <div class="w-24 h-24 rounded-lg bg-cover bg-center border border-ink/10 shrink-0" style="background-image:url('${thumbUrl}')" data-thumb></div>

    <div class="flex-1 min-w-0">
      <p class="font-display text-[1.05rem] leading-snug m-0">${item.name}</p>
      <p class="text-[0.8rem] text-[#6b6459] m-0 mb-3">Recycled ${item.source_category}${item.price ? ` · ₹${Number(item.price).toFixed(0)}` : ""}</p>

      <div class="flex flex-wrap gap-3 items-center">
        <label class="btn btn-secondary btn-sm cursor-pointer">
          Upload photo
          <input type="file" accept="image/*" class="hidden" hidden data-file-input />
        </label>
        <span class="text-[0.8rem] text-[#8a8378]">or</span>
        <input type="url" placeholder="Paste an image URL" class="field-input flex-1 min-w-[200px]" data-url-input value="${item.image_url ? item.image_url.startsWith("data:") ? "" : item.image_url : ""}" />
        <button type="button" class="btn btn-primary btn-sm" data-save-btn>Save</button>
      </div>
      <p class="field-hint mt-2" data-status></p>
    </div>
  `;

  const thumbEl = row.querySelector("[data-thumb]");
  const fileInput = row.querySelector("[data-file-input]");
  const urlInput = row.querySelector("[data-url-input]");
  const saveBtn = row.querySelector("[data-save-btn]");
  const statusEl = row.querySelector("[data-status]");

  let pendingUrl = null; // set once a file finishes uploading; url-input is used otherwise

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;

    statusEl.textContent = "Uploading…";
    saveBtn.disabled = true;

    const path = `circle/${item.id}-${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseClient.storage.from("product-images").upload(path, file);

    if (uploadError) {
      statusEl.textContent = "Upload failed — make sure the 'product-images' storage bucket exists (see supabase-migrations/002_brand_portal.sql).";
      console.error(uploadError);
      saveBtn.disabled = false;
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage.from("product-images").getPublicUrl(path);
    pendingUrl = publicUrlData.publicUrl;
    urlInput.value = pendingUrl;
    thumbEl.style.backgroundImage = `url('${pendingUrl}')`;
    statusEl.textContent = "Uploaded — click Save to publish.";
    saveBtn.disabled = false;
  });

  saveBtn.addEventListener("click", async () => {
    const newUrl = (urlInput.value || "").trim();
    if (!newUrl) {
      statusEl.textContent = "Add a photo or paste a URL first.";
      return;
    }

    saveBtn.disabled = true;
    statusEl.textContent = "Saving…";

    const { error } = await supabaseClient
      .from("upcycled_items")
      .update({ image_url: newUrl })
      .eq("id", item.id);

    saveBtn.disabled = false;

    if (error) {
      statusEl.textContent = "Couldn't save — check the browser console for details.";
      console.error(error);
      return;
    }

    thumbEl.style.backgroundImage = `url('${newUrl}')`;
    statusEl.textContent = "Saved ✓";
    pendingUrl = null;
  });

  return row;
}

init();
