// ============================================================
// Cart utilities — shared across every page.
// The cart lives in localStorage (no backend cart table yet),
// keyed by a combination of product + variant so different
// sizes/colors of the same product are separate line items.
// ============================================================

const CART_KEY = "rethread_cart";

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Cart read error:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

// itemType distinguishes a catalog "product" from a ReThread Circle
// "upcycled" piece — the two tables have their own id sequences, so a
// product #3 and an upcycled item #3 must never be treated as the same
// cart line. Older cart entries saved before this existed have no
// itemType, so we default those to "product" for backwards compatibility.
function lineItemKey(itemType, productId, variantId) {
  return `${itemType || "product"}::${productId}::${variantId || "novariant"}`;
}

function addToCart(item) {
  // item: { itemType, productId, variantId, name, imageUrl, color, size, price, brand }
  const itemType = item.itemType || "product";
  const cart = getCart();
  const key = lineItemKey(itemType, item.productId, item.variantId);
  const existing = cart.find((line) => lineItemKey(line.itemType, line.productId, line.variantId) === key);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, itemType, quantity: 1 });
  }

  saveCart(cart);
}

function updateQuantity(itemType, productId, variantId, quantity) {
  let cart = getCart();
  const key = lineItemKey(itemType, productId, variantId);

  if (quantity <= 0) {
    cart = cart.filter((line) => lineItemKey(line.itemType, line.productId, line.variantId) !== key);
  } else {
    const line = cart.find((line) => lineItemKey(line.itemType, line.productId, line.variantId) === key);
    if (line) line.quantity = quantity;
  }

  saveCart(cart);
}

function removeFromCart(itemType, productId, variantId) {
  updateQuantity(itemType, productId, variantId, 0);
}

function getCartCount() {
  return getCart().reduce((sum, line) => sum + line.quantity, 0);
}

function getCartTotal() {
  return getCart().reduce((sum, line) => sum + line.quantity * line.price, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll(".cart-count-badge").forEach((badge) => {
    badge.textContent = count > 0 ? `(${count})` : "";
  });
}

// Run on every page load
document.addEventListener("DOMContentLoaded", updateCartBadge);
