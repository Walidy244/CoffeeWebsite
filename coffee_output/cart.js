function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function removeFromCart(productId) {
  const cart = getCart().filter(i => i.id !== productId);
  saveCart(cart);
  renderCart(localStorage.getItem('lang') || 'en');
}

let translations = {};
async function loadTranslations() {
  const res = await fetch('translations.json');
  translations = await res.json();
}
function applyLang(lang) {
  const t = translations[lang];
  if (!t) return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const setEl = (sel, key) => {
    const el = document.querySelector(sel);
    if (el && t[key] !== undefined) el.textContent = t[key];
  };

  setEl('.hero-navbar-subtitle', 'subtitle');
  setEl('.continue-text', 'continueShopping');
  setEl('#your-cart-header', 'cartTitle');
  setEl('#lang-toggle', 'langToggle');

  renderCart(lang);
}

function renderCart(lang) {
  lang = lang || 'en';
  const t = translations[lang] || {};
  const cart = getCart();
  const container = document.getElementById('cart-content');

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <img src="img/shopping-bag.png" alt="Cart" class="cart-logo">
        <div class="subheader-cart-logo">${t.emptyCart || 'Your cart is empty'}</div>
        <span class="cart-description">${t.emptyDesc || "Looks like you haven't added any coffee yet. Let's fix that."}</span>
        <a href="index.html">
          <button class="shop-coffee-button">${t.shopCoffee || 'SHOP COFFEE'}</button>
        </a>
      </div>`;
    return;
  }

  let subtotal = 0;
  let itemsHtml = '';
  cart.forEach(item => {
    const itemTotal = (parseFloat(item.price.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0) * item.qty;
    subtotal += itemTotal;
    const roastLabel = (t.products && t.products[item.coffeeName])
      ? t.products[item.coffeeName].roast
      : item.roast;
    itemsHtml += `
      <div class="cart-item">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.coffeeName}</p>
          <p class="cart-item-roast">${roastLabel}</p>
          <p class="cart-item-qty">${t.qty || 'Qty'}: ${item.qty}</p>
        </div>
        <div class="cart-item-right">
          <p class="cart-item-price">${item.price}</p>
          <button class="cart-delete-btn" data-id="${item.id}" aria-label="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>`;
  });

  const cartLines = cart.map(i => {
    const p = parseFloat(i.price.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
    return `• ${i.coffeeName} (${i.weight}) x${i.qty} = ${i.price}`;
  }).join('%0A');
  const subtotalFormatted = subtotal.toLocaleString() + ' L.L';
  const waMsg = `Hello! I'd like to order:%0A${cartLines}%0ATotal: ${subtotalFormatted}`;
  const waLink = `https://wa.me/96178943061?text=${waMsg}`;

  container.innerHTML = `
    <div class="cart-items-wrapper">
      ${itemsHtml}
      <div class="cart-subtotal-row">
        <span>${t.subtotal || 'SUBTOTAL'}</span>
        <span>${subtotalFormatted}</span>
      </div>
      <a href="${waLink}" target="_blank" rel="noopener">
        <button class="pay-whatsapp-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
               fill="currentColor" style="flex-shrink:0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15
              -.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075
              -.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059
              -.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52
              .149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52
              -.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51
              -.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372
              -.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074
              .149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625
              .712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413
              .248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.116 1.532 5.845L0 24l6.335-1.51
              A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818
              a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.727.888.925-3.618-.235-.372
              A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12
              17.43 21.818 12 21.818z"/>
          </svg>
          ${t.payWhatsapp || 'PAY VIA WHATSAPP'}
        </button>
      </a>
    </div>`;

  document.querySelectorAll('.cart-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

const langToggle = document.getElementById('lang-toggle');
langToggle.addEventListener('click', () => {
  const current = localStorage.getItem('lang') || 'en';
  const next = current === 'en' ? 'ar' : 'en';
  localStorage.setItem('lang', next);
  applyLang(next);
});

(async () => {
  await loadTranslations();
  const savedLang = localStorage.getItem('lang') || 'en';
  applyLang(savedLang);
})();
