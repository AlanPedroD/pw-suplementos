// ================= IMPORTS =================
import { renderCategories } from "./ui.js";
import { renderProducts } from "./ui.js";
import { renderProductModal } from "./ui.js";

import { getProducts, db } from "./firebase.js";

import { filterProducts } from "./filters.js";
import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  cart
} from "./cart.js";
import { updateCartCount } from "./ui.js";
import { renderCart } from "./ui.js";

import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// ESTADO GLOBAL PRODUTOS
let allProducts = [];

// ================= ELEMENTOS =================
const modal = document.querySelector(".product-modal");
const modalOverlay = document.querySelector(".product-modal-overlay");
const closeModalBtn = document.querySelector(".close-modal");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");
const overlay = document.querySelector(".menu-overlay");
const cartSidebar = document.querySelector(".cart-sidebar");
const cartOverlay = document.querySelector(".cart-overlay");
const cartIcon = document.querySelector(".cart-icon");
const closeCartBtn = document.querySelector(".close-cart");
const checkoutBtn = document.querySelector(".checkout-btn");
const checkoutModal = document.querySelector(".checkout-modal");
const checkoutOverlay = document.querySelector(".checkout-overlay");
const closeCheckoutBtn = document.querySelector(".close-checkout");
const paymentSelect = document.querySelector('select[name="payment"]');
const pixMessage = document.querySelector(".pix-message");
const checkoutForm = document.querySelector(".checkout-form");


// ================= FUNÇÕES MENU =================
function openMenu() {
  menuToggle.classList.add("active");
  mobileMenu.classList.add("active");
  overlay.classList.add("active");
}

function closeMenu() {
  menuToggle.classList.remove("active");
  mobileMenu.classList.remove("active");
  overlay.classList.remove("active");
}

// ================= FUNÇÕES MODAL =================
function openModal() {
  modal.classList.add("active");
  modalOverlay.classList.add("active");
}

function closeModal() {
  modal.classList.remove("active");
  modalOverlay.classList.remove("active");
}

// ================= FUNÇÕES CARRINHO =================
function openCart() {
  cartSidebar.classList.add("active");
  cartOverlay.classList.add("active");
}

function closeCart() {
  cartSidebar.classList.remove("active");
  cartOverlay.classList.remove("active");
}

// ================= FUNÇÕES CHECKOUT =================
function openCheckout() {
  checkoutModal.classList.add("active");
  checkoutOverlay.classList.add("active");
}

function closeCheckout() {
  checkoutModal.classList.remove("active");
  checkoutOverlay.classList.remove("active");
}

// ================= FUNÇÕES FILTRO =================
function handleCategoryClick(category) {
  const filteredProducts = filterProducts(allProducts, category);
  renderProducts(filteredProducts);
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
}

const searchInput =
  document.querySelector(
    ".search-input"
  );

const searchBtn =
  document.querySelector(
    ".search-btn"
  );
  
// ================= BUSCAR PRODUTOS =================
function searchProducts() {

  const searchTerm =
    searchInput.value
      .toLowerCase()
      .trim();

  const filtered =
    allProducts.filter(
      product =>

        product.name
          .toLowerCase()
          .includes(searchTerm)

    );

  renderProducts(filtered);

  // SCROLL PRODUTOS
  document
    .getElementById("products")
    .scrollIntoView({

      behavior: "smooth"

    });

}

// BOTÃO BUSCA
searchBtn.addEventListener(
  "click",

  searchProducts
);

// ENTER BUSCA
searchInput.addEventListener(
  "keydown",

  (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      searchProducts();

    }

  }

);

// ================= BUSCA PRODUTOS =================
searchInput.addEventListener(
  "input",

  () => {

    const searchTerm =
      searchInput.value
        .toLowerCase();

    const filtered =
      allProducts.filter(
        product =>

          product.name
            .toLowerCase()
            .includes(searchTerm)

      );

    renderProducts(filtered);

  }

);  

// ================= ATUALIZAR CARRINHO =================
function updateCartUI() {
  updateCartCount(cart);
  renderCart(cart);
}

// ================= TOTAL CARRINHO =================
function calculateCartTotal() {
  return cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}


// ================= INICIALIZAÇÃO =================
document.addEventListener("DOMContentLoaded", async () => {
  renderCategories();

  allProducts = await getProducts();
  renderProducts(allProducts);
  renderCart(cart);
  updateCartCount(cart);

  await renderHero();
  handleHeroClick();
});


// ================= BUSCAR BANNERS DO FIREBASE =================
async function getBanners() {
  try {
    const q = query(collection(db, "banners"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    const banners = [];
    querySnapshot.forEach((doc) => {
      banners.push({ id: doc.id, ...doc.data() });
    });
    return banners;
  } catch (error) {
    console.error("Erro ao buscar banners:", error);
    return [];
  }
}


// ================= HERO =================
let currentBanner = 0;
let carouselInterval = null;
let banners = [];

async function renderHero() {
  // BUSCA BANNERS DO FIREBASE
  banners = await getBanners();

  if (banners.length === 0) return;

  const hero = document.querySelector(".hero-slide");

  // BANNERS — usa <picture> para imagem responsiva (mobile/desktop)
  hero.innerHTML = banners.map(banner => `
    <picture class="hero-banner-picture" data-category="${banner.category}">
      <source media="(max-width: 768px)" srcset="${banner.imageMobile}">
      <img
        src="${banner.imageDesktop}"
        alt="Banner"
        class="hero-banner"
        data-category="${banner.category}"
      >
    </picture>
  `).join("");

  const heroContainer = document.querySelector(".hero");

  // BOTÃO ANTERIOR
  const prevBtn = document.createElement("button");
  prevBtn.classList.add("hero-btn", "prev");
  prevBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;
  prevBtn.addEventListener("click", () => {
    const prev = (currentBanner - 1 + banners.length) % banners.length;
    goToBanner(prev);
    resetInterval();
  });

  // BOTÃO PRÓXIMO
  const nextBtn = document.createElement("button");
  nextBtn.classList.add("hero-btn", "next");
  nextBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;
  nextBtn.addEventListener("click", () => {
    const next = (currentBanner + 1) % banners.length;
    goToBanner(next);
    resetInterval();
  });

  heroContainer.appendChild(prevBtn);
  heroContainer.appendChild(nextBtn);

  // DOTS
  const dotsContainer = document.createElement("div");
  dotsContainer.classList.add("hero-dots");
  dotsContainer.innerHTML = banners.map((_, i) => `
    <div class="hero-dot ${i === 0 ? "active" : ""}" data-index="${i}"></div>
  `).join("");
  heroContainer.appendChild(dotsContainer);

  // DOTS CLICK
  dotsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("hero-dot")) {
      goToBanner(Number(e.target.dataset.index));
      resetInterval();
    }
  });

  startCarousel();
}

function goToBanner(index) {
  currentBanner = index;
  const hero = document.querySelector(".hero-slide");
  hero.style.transform = `translateX(-${index * 100}%)`;

  document.querySelectorAll(".hero-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === index);
  });
}

function startCarousel() {
  carouselInterval = setInterval(() => {
    const next = (currentBanner + 1) % banners.length;
    goToBanner(next);
  }, 4000);
}

function resetInterval() {
  clearInterval(carouselInterval);
  startCarousel();
}


// ================= HERO CLICK =================
function handleHeroClick() {
  document.addEventListener("click", async (e) => {
    // Aceita clique tanto na imagem quanto no <picture>
    const bannerEl = e.target.closest("[data-category].hero-banner-picture") || e.target.closest(".hero-banner");

    if (bannerEl) {
      const category = bannerEl.dataset.category;

      const products = await getProducts();
      const filteredProducts = filterProducts(products, category);
      renderProducts(filteredProducts);

      document.getElementById("products").scrollIntoView({ behavior: "smooth" });
    }
  });
}


// ================= EVENTOS GLOBAIS =================
document.addEventListener("click", (e) => {

  // ================= IMAGEM PRODUTO =================
  const image = e.target.closest(".product-image");
  if (image) {
    const productId = image.dataset.productId;
    const product = allProducts.find(p => p.id === productId);
    renderProductModal(product);
    openModal();
    return;
  }

  // ================= ADICIONAR AO CARRINHO =================
  const addCartBtn = e.target.closest(".add-cart-btn");
  if (addCartBtn) {
    const productId = addCartBtn.dataset.productId;
    const product = allProducts.find(p => p.id === productId);
    addToCart(product);
    updateCartUI();
    closeModal();

    // ANIMAR BADGE
    const cartCount = document.querySelector(".cart-count");
    cartCount.classList.remove("pop");
    void cartCount.offsetWidth; // força o reset da animação
    cartCount.classList.add("pop");

    return;
  }

  // ================= AUMENTAR =================
  const increaseBtn = e.target.closest(".increase-btn");
  if (increaseBtn) {
    const productId = increaseBtn.dataset.productId;
    increaseQuantity(productId);
    updateCartUI();
    return;
  }

  // ================= DIMINUIR =================
  const decreaseBtn = e.target.closest(".decrease-btn");
  if (decreaseBtn) {
    const productId = decreaseBtn.dataset.productId;
    decreaseQuantity(productId);
    updateCartUI();
    return;
  }

  // ================= REMOVER =================
  const removeBtn = e.target.closest(".remove-btn");
  if (removeBtn) {
    const productId = removeBtn.dataset.productId;
    removeFromCart(productId);
    updateCartUI();
    return;
  }

  // ================= CATEGORIAS =================
  const btn = e.target.closest("[data-category]");
  if (btn && !btn.classList.contains("hero-banner-picture") && !btn.classList.contains("hero-banner")) {
    const category = btn.dataset.category;
    handleCategoryClick(category);
    closeMenu();
  }

});


// ================= EVENTOS ESPECÍFICOS =================

// MENU MOBILE
menuToggle.addEventListener("click", () => {
  if (mobileMenu.classList.contains("active")) {
    closeMenu();
  } else {
    openMenu();
  }
});

// ENVIAR PEDIDO
checkoutForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(checkoutForm);
  const customerName = formData.get("name");
  const address = formData.get("address");
  const payment = formData.get("payment");
  const notes = formData.get("notes");

  const subtotal = calculateCartTotal();
  const hasPixDiscount = payment === "Pix";
  const discount = hasPixDiscount ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  const productsMessage = cart.map(item => `
• ${item.name}
Qtd: ${item.quantity}
Valor: R$ ${item.price}
`).join("");

  const message = `
🛒 NOVO PEDIDO

👤 Cliente:
${customerName}

📍 Endereço:
${address}

💳 Pagamento:
${payment}

📝 Observações:
${notes || "Nenhuma"}

----------------------------

${productsMessage}

----------------------------

💰 Subtotal:
R$ ${subtotal.toFixed(2)}

🎉 Desconto:
R$ ${discount.toFixed(2)}

✅ Total:
R$ ${total.toFixed(2)}
`;

  const phone = "5581999999999";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");
  clearCart();
  updateCartUI();
  closeCheckout();
  closeCart();
  checkoutForm.reset();
  pixMessage.style.display = "none";
});

// ABRIR CHECKOUT
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;
  openCheckout();
});

// FECHAR CHECKOUT
checkoutOverlay.addEventListener("click", closeCheckout);
closeCheckoutBtn.addEventListener("click", closeCheckout);

// PIX
paymentSelect.addEventListener("change", () => {
  if (paymentSelect.value === "Pix") {
    pixMessage.style.display = "block";
  } else {
    pixMessage.style.display = "none";
  }
});

// FECHAR MENU
overlay.addEventListener("click", closeMenu);

// FECHAR MODAL
modalOverlay.addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);

// ABRIR CARRINHO
cartIcon.addEventListener("click", openCart);

// FECHAR CARRINHO
cartOverlay.addEventListener("click", closeCart);
closeCartBtn.addEventListener("click", closeCart);
