// ============================================================
// Cart page: renders line items from localStorage,
// handles quantity changes and removal.
// ============================================================

function renderCart() {
  const cart = getCart();
  const itemsEl = document.getElementById("cart-items");
  const emptyEl = document.getElementById("cart-empty");
  const summaryEl = document.getElementById("cart-summary");
  const totalEl = document.getElementById("cart-total");

  if (cart.length === 0) {
    itemsEl.innerHTML = "";
    emptyEl.hidden = false;
    summaryEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  summaryEl.hidden = false;

  itemsEl.innerHTML = cart.map((line) => `
    <div class="grid grid-cols-[70px_1fr] sm:grid-cols-[84px_1fr_auto_auto] gap-5 items-center pb-6 border-b border-ink/[0.12]" data-item-type="${line.itemType || "product"}" data-product-id="${line.productId}" data-variant-id="${line.variantId || ""}">
      <div class="w-[70px] h-[92px] sm:w-20 sm:h-[104px] bg-cotton-dark bg-cover bg-center rounded-lg border border-ink/10" style="background-image: url('${line.imageUrl || "https://placehold.co/300x400/e2dac8/6b6459?text=No+Image"}');"></div>
      <div class="flex flex-col gap-1">
        ${line.brand ? `<span class="text-[0.78rem] text-indigo font-semibold">${line.brand}</span>` : ""}
        <span class="font-display text-[1.05rem] leading-snug">${line.name}</span>
        ${line.color || line.size ? `<span class="text-[0.82rem] text-[#6b6459]">${[line.color, line.size].filter(Boolean).join(" / ")}</span>` : ""}
        <span class="font-semibold">₹${Number(line.price).toFixed(0)}</span>
      </div>
      <div class="flex items-center gap-2.5">
        <button class="w-7 h-7 border border-ink/25 bg-cotton-dark rounded-md cursor-pointer text-base leading-none hover:border-ink/50 transition-colors" data-action="decrease" aria-label="Decrease quantity">−</button>
        <span class="min-w-[1.5em] text-center font-semibold">${line.quantity}</span>
        <button class="w-7 h-7 border border-ink/25 bg-cotton-dark rounded-md cursor-pointer text-base leading-none hover:border-ink/50 transition-colors" data-action="increase" aria-label="Increase quantity">+</button>
        <button class="btn-danger-ghost rounded-md" data-action="remove">Remove</button>
      </div>
      <div class="font-semibold min-w-[4.5em] text-right">₹${Number(line.price * line.quantity).toFixed(0)}</div>
    </div>
  `).join("");

  totalEl.textContent = `₹${getCartTotal().toFixed(0)}`;

  itemsEl.querySelectorAll("[data-product-id]").forEach((lineEl) => {
    const itemType = lineEl.dataset.itemType || "product";
    const productId = Number(lineEl.dataset.productId);
    const variantId = lineEl.dataset.variantId ? Number(lineEl.dataset.variantId) : null;
    const currentLine = cart.find((l) => (l.itemType || "product") === itemType && l.productId === productId && (l.variantId || null) === variantId);

    lineEl.querySelector("[data-action='increase']").addEventListener("click", () => {
      updateQuantity(itemType, productId, variantId, currentLine.quantity + 1);
      renderCart();
    });
    lineEl.querySelector("[data-action='decrease']").addEventListener("click", () => {
      updateQuantity(itemType, productId, variantId, currentLine.quantity - 1);
      renderCart();
    });
    lineEl.querySelector("[data-action='remove']").addEventListener("click", () => {
      removeFromCart(itemType, productId, variantId);
      renderCart();
    });
  });
}

renderCart();
