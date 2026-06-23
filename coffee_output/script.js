import { products } from './product.js';

function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = products.find(p => p.id === productId);
    if (product) cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  updateCartBadge();
  showAddedFeedback(productId);
}
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = total;
  if (total > 0) badge.classList.add('visible');
  else badge.classList.remove('visible');
}
function showAddedFeedback(productId) {
  const btn = document.querySelector(`[data-product-id="${productId}"]`);
  if (!btn) return;
  const lang = localStorage.getItem('lang') || 'en';
  const original = btn.textContent;
  btn.textContent = lang === 'ar' ? '✓ أُضيف' : '✓ Added';
  btn.style.backgroundColor = '#111';
  btn.style.color = '#FAF0E6';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.backgroundColor = '';
    btn.style.color = '';
  }, 900);
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

  setEl('.announcement-bar p', 'announcement');
  setEl('.hero-navbar-subtitle', 'subtitle');
  setEl('#cartButton .cart-label', 'cart');
  setEl('#home-link', 'home');
  setEl('#shop-link', 'shop');
  setEl('#contact-link', 'contactUs');
  setEl('.overlay-text h1', 'heroTitle');
  setEl('.overlay-text p', 'heroDesc');
  setEl('.overlay-text button', 'shopCoffee');
  setEl('#choose-your-brew', 'chooseYourBrew');
  setEl('.hours', 'hours');
  setEl('.footer-subtitle', 'subtitle');
  setEl('#lang-toggle', 'langToggle');
  setEl('.footer-rights', 'rights');
  setEl('.contact', 'contact');
  setEl('#lang-toggle', 'langToggle');

  setEl('#loc-label',    'locLabel');
  setEl('#loc-title',    'locTitle');
  setEl('#loc-desc',     'locDesc');
  setEl('#loc-city',     'locCity');
  setEl('#loc-delivery', 'locDelivery');
  setEl('#loc-wa-sub',   'locWaSub');
  setEl('#loc-wa-btn',   'locWaBtn');

  const openingTimes = document.querySelectorAll('.opening-time');
  if (openingTimes[0] && t['monFri']) openingTimes[0].textContent = t['monFri'];
  if (openingTimes[1] && t['sat'])    openingTimes[1].textContent = t['sat'];

  const contactInfos = document.querySelectorAll('.contact-info');
  if (contactInfos[0] && t['contactWant']) contactInfos[0].textContent = t['contactWant'];
  if (contactInfos[1] && t['contactInfo']) contactInfos[1].textContent = t['contactInfo'];

  const currentWeight = getCurrentWeight();
  renderProducts(currentWeight, lang);
}

function getCurrentWeight() {
  const dot2 = document.getElementById('js-dot-2');
  const dot3 = document.getElementById('js-dot-3');
  if (dot3 && dot3.classList.contains('active-dot')) return '1kg';
  if (dot2 && dot2.classList.contains('active-dot')) return '500g';
  return '200g';
}

function renderProducts(selectedWeight, lang) {
  lang = lang || localStorage.getItem('lang') || 'en';
  const t = translations[lang] || {};
  const productsContainer = document.querySelector('.products-container');
  let html = '';
  products.forEach(product => {
    if (product.weight === selectedWeight) {
      const roastLabel = (t.products && t.products[product.coffeeName])
        ? t.products[product.coffeeName].roast
        : product.roast;
      const nameLabel = (lang === 'ar' && t.products && t.products[product.coffeeName] && t.products[product.coffeeName].name)
        ? t.products[product.coffeeName].name
        : product.coffeeName;
      const addLabel = t.addToCart || 'Add →';
      html += `
        <div class="product-container">
          <img src="${product.image}" class="choose-your-brew-image" alt="${product.coffeeName}">
          <div class="product-info">
            <p class="coffee-origin">${product.origin}</p>
            <p class="coffee-name">${nameLabel}</p>
            <p class="coffee-roast">${roastLabel}</p>
            <p class="coffee-weight">${product.weight}</p>
          </div>
          <hr class="thin-line">
          <div class="price-and-button">
            <p class="coffee-price">${product.price}</p>
            <button class="add-to-cart-button js-add-to-cart-button"
                    data-product-id="${product.id}">${addLabel}</button>
          </div>
        </div>`;
    }
  });
  productsContainer.innerHTML = html;

  document.querySelectorAll('.js-add-to-cart-button').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.productId));
  });
}

const leftArrow = document.querySelector('.js-left-arrow');
const rightArrow = document.querySelector('.js-right-arrow');
const dot_1 = document.getElementById('js-dot-1');
const dot_2 = document.getElementById('js-dot-2');
const dot_3 = document.getElementById('js-dot-3');
const mobileDropdown = document.querySelector('.js-mobile-weight-dropdown');

function setActive(activeDot, weight) {
  [dot_1, dot_2, dot_3].forEach(d => {
    d.classList.remove('active-dot');
    d.classList.add('dot');
  });
  activeDot.classList.remove('dot');
  activeDot.classList.add('active-dot');
  renderProducts(weight);
}

if (leftArrow) {
  leftArrow.addEventListener('click', () => {
    if (dot_1.classList.contains('active-dot')) setActive(dot_3, '1kg');
    else if (dot_3.classList.contains('active-dot')) setActive(dot_2, '500g');
    else if (dot_2.classList.contains('active-dot')) setActive(dot_1, '200g');
  });
}
if (rightArrow) {
  rightArrow.addEventListener('click', () => {
    if (dot_1.classList.contains('active-dot')) setActive(dot_2, '500g');
    else if (dot_2.classList.contains('active-dot')) setActive(dot_3, '1kg');
    else if (dot_3.classList.contains('active-dot')) setActive(dot_1, '200g');
  });
}
if (mobileDropdown) {
  mobileDropdown.addEventListener('change', () => renderProducts(mobileDropdown.value));
}

const langToggle = document.getElementById('lang-toggle');
if (langToggle) langToggle.addEventListener('click', () => {
  const current = localStorage.getItem('lang') || 'en';
  const next = current === 'en' ? 'ar' : 'en';
  localStorage.setItem('lang', next);
  applyLang(next);
});

(async () => {
  await loadTranslations();
  const savedLang = localStorage.getItem('lang') || 'en';
  renderProducts('200g', savedLang);
  applyLang(savedLang);
  updateCartBadge();
})();
