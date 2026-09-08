// ============================================================
// Take-back form: validates, uploads photos, and inserts into
// take_back_requests. Photos are required (min 1, max 5).
// ============================================================

const form = document.getElementById("takeback-form");
const successPanel = document.getElementById("success-panel");
const statusEl = document.getElementById("form-status");
const submitBtn = document.getElementById("submit-btn");

const STATUS_ERROR_CLASS = "banner banner-error";
const STATUS_SUCCESS_CLASS = "banner banner-success";
const STATUS_DEFAULT_CLASS = "text-[0.9rem] min-h-[1.2em] m-0";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB

// ---- Instant payout estimate ----
const BASE_VALUE = {
  "Jeans": 280, "T-Shirts": 90, "Shirts": 150, "Trousers": 180, "Jackets": 450,
  "Dresses": 220, "Tops": 110, "Skirts": 160, "Kurtas": 170, "Sarees": 300,
  "Sneakers": 260, "Sandals": 110, "Formal Shoes": 240, "Boots": 320,
  "Belts": 90, "Bags": 200, "Other": 100,
};
const CONDITION_MULT = {
  like_new: [0.9, 1.1],
  good: [0.55, 0.75],
  fair: [0.25, 0.4],
  worn_out: [0.05, 0.12],
};

const categorySelect = document.getElementById("item_category");
const conditionSelect = document.getElementById("condition_reported");
const estimateRangeEl = document.getElementById("estimate-range");

function roundTo10(n) {
  return Math.max(10, Math.round(n / 10) * 10);
}

function updateEstimate() {
  const category = categorySelect.value;
  const condition = conditionSelect.value;
  if (!category) {
    estimateRangeEl.textContent = "Pick a category to see one";
    return { min: null, max: null };
  }
  const base = BASE_VALUE[category] || BASE_VALUE.Other;
  const [lowMult, highMult] = CONDITION_MULT[condition] || CONDITION_MULT.good;
  const min = roundTo10(base * lowMult);
  const max = roundTo10(base * highMult);
  estimateRangeEl.textContent = `₹${min} – ₹${max}`;
  return { min, max };
}
categorySelect.addEventListener("change", updateEstimate);
conditionSelect.addEventListener("change", updateEstimate);

// ---- Condition guide toggle ----
const conditionGuideToggle = document.getElementById("condition-guide-toggle");
const conditionGuide = document.getElementById("condition-guide");
conditionGuideToggle.addEventListener("click", () => {
  conditionGuide.hidden = !conditionGuide.hidden;
  conditionGuideToggle.textContent = conditionGuide.hidden ? "What do these mean?" : "Hide";
});

// ---- Pickup vs drop-off ----
const pickupFields = document.getElementById("pickup-fields");
form.querySelectorAll("input[name='pickup_or_dropoff']").forEach((radio) => {
  radio.addEventListener("change", () => {
    pickupFields.hidden = form.querySelector("input[name='pickup_or_dropoff']:checked").value !== "pickup";
  });
});

// ---- Photo upload (drag & drop + file picker), required ----
const dropzone = document.getElementById("dropzone");
const photoInput = document.getElementById("photo-input");
const photoPreviews = document.getElementById("photo-previews");
const photoStatus = document.getElementById("photo-status");

let selectedFiles = []; // File[]

function renderPreviews() {
  photoPreviews.innerHTML = selectedFiles.map((file, i) => {
    const url = URL.createObjectURL(file);
    return `
      <div class="relative aspect-square rounded-lg overflow-hidden border border-ink/15 bg-cover bg-center" style="background-image:url('${url}')">
        <button type="button" class="absolute top-1 right-1 w-5 h-5 bg-ink/75 text-cotton text-[0.7rem] rounded-full leading-none" data-remove-photo="${i}" aria-label="Remove photo">✕</button>
      </div>
    `;
  }).join("");

  photoPreviews.querySelectorAll("[data-remove-photo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedFiles.splice(Number(btn.dataset.removePhoto), 1);
      renderPreviews();
      updatePhotoStatus();
    });
  });
}

function updatePhotoStatus() {
  if (selectedFiles.length === 0) {
    photoStatus.textContent = "No photos added yet.";
    photoStatus.className = "field-hint m-0";
  } else {
    photoStatus.textContent = `${selectedFiles.length} photo${selectedFiles.length === 1 ? "" : ""} added.`;
    photoStatus.className = "field-hint m-0 text-moss";
  }
}

function addFiles(fileList) {
  const incoming = Array.from(fileList || []);
  const errors = [];

  for (const file of incoming) {
    if (selectedFiles.length >= MAX_PHOTOS) {
      errors.push(`Only up to ${MAX_PHOTOS} photos allowed.`);
      break;
    }
    if (!file.type.startsWith("image/")) {
      errors.push(`"${file.name}" isn't an image.`);
      continue;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      errors.push(`"${file.name}" is over 8MB.`);
      continue;
    }
    selectedFiles.push(file);
  }

  renderPreviews();
  updatePhotoStatus();

  if (errors.length) {
    photoStatus.textContent = errors.join(" ");
    photoStatus.className = "field-hint m-0 text-rust";
  }
}

photoInput.addEventListener("change", () => {
  addFiles(photoInput.files);
  photoInput.value = "";
});

["dragover", "dragenter"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.add("border-indigo", "bg-indigo/5");
  });
});
["dragleave", "drop"].forEach((evt) => {
  dropzone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropzone.classList.remove("border-indigo", "bg-indigo/5");
  });
});
dropzone.addEventListener("drop", (e) => {
  addFiles(e.dataTransfer.files);
});

updatePhotoStatus();

// ---- Pre-fill contact details for a signed-in customer, if we have them on file ----
(async function prefillFromProfile() {
  if (typeof supabaseClient === "undefined") return;
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return;

  document.getElementById("contact_email").value = user.email || "";

  const { data: customer } = await supabaseClient
    .from("customers")
    .select("full_name, phone, address_line1, city, state, postal_code")
    .eq("id", user.id)
    .maybeSingle();

  if (customer) {
    if (customer.full_name) document.getElementById("contact_name").value = customer.full_name;
    if (customer.phone) document.getElementById("contact_phone").value = customer.phone;
    const addressParts = [customer.address_line1, customer.city, customer.state, customer.postal_code].filter(Boolean);
    if (addressParts.length) document.getElementById("pickup_address").value = addressParts.join(", ");
  }
})();

// ---- Upload photos to Supabase Storage, return public URLs ----
async function uploadPhotos(files) {
  const urls = [];
  for (const file of files) {
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabaseClient.storage.from("takeback-photos").upload(path, file);
    if (error) throw error;
    const { data } = supabaseClient.storage.from("takeback-photos").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (selectedFiles.length === 0) {
    statusEl.textContent = "Please add at least one photo of the item before submitting.";
    statusEl.className = STATUS_ERROR_CLASS;
    dropzone.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const contactEmail = document.getElementById("contact_email").value.trim();
  const contactPhone = document.getElementById("contact_phone").value.trim();

  if (!contactEmail && !contactPhone) {
    statusEl.textContent = "Please provide at least an email or a phone number.";
    statusEl.className = STATUS_ERROR_CLASS;
    return;
  }

  const pickupOrDropoff = form.querySelector("input[name='pickup_or_dropoff']:checked").value;
  const estimate = updateEstimate();

  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="spinner"></span> Uploading photos…`;
  statusEl.textContent = "";

  let photoUrls;
  try {
    photoUrls = await uploadPhotos(selectedFiles);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit for grading";
    statusEl.textContent = "Couldn't upload your photos. Please try again.";
    statusEl.className = STATUS_ERROR_CLASS;
    console.error(err);
    return;
  }

  submitBtn.innerHTML = `<span class="spinner"></span> Submitting…`;

  const payload = {
    item_category: categorySelect.value,
    material: document.getElementById("material").value.trim() || null,
    item_description: document.getElementById("item_description").value.trim() || null,
    condition_reported: conditionSelect.value,
    image_url: photoUrls[0] || null,
    photo_urls: photoUrls,
    pickup_or_dropoff: pickupOrDropoff,
    pickup_date: pickupOrDropoff === "pickup" ? (document.getElementById("pickup_date").value || null) : null,
    pickup_address: pickupOrDropoff === "pickup" ? (document.getElementById("pickup_address").value.trim() || null) : null,
    estimated_payout_min: estimate.min,
    estimated_payout_max: estimate.max,
    terms_accepted: document.getElementById("terms_accepted").checked,
    contact_name: document.getElementById("contact_name").value.trim(),
    contact_email: contactEmail || null,
    contact_phone: contactPhone || null,
  };

  const { data: { user } } = await supabaseClient.auth.getUser();
  if (user) {
    payload.user_id = user.id;
  }

  const { data: inserted, error } = await supabaseClient.from("take_back_requests").insert([payload]).select().single();

  submitBtn.disabled = false;
  submitBtn.textContent = "Submit for grading";

  if (error) {
    statusEl.textContent = "Something went wrong submitting this. Please try again.";
    statusEl.className = STATUS_ERROR_CLASS;
    console.error(error);
    return;
  }

  const refNumber = inserted && inserted.id ? `RT-${String(inserted.id).padStart(5, "0")}` : "RT-PENDING";
  document.getElementById("reference-number").textContent = refNumber;
  document.getElementById("success-mode").textContent = pickupOrDropoff === "pickup" ? "pickup" : "drop-off";

  form.hidden = true;
  successPanel.hidden = false;
  successPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.getElementById("submit-another-btn").addEventListener("click", () => {
  form.reset();
  selectedFiles = [];
  renderPreviews();
  updatePhotoStatus();
  pickupFields.hidden = true;
  estimateRangeEl.textContent = "Pick a category to see one";
  statusEl.textContent = "";
  successPanel.hidden = true;
  form.hidden = false;
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
