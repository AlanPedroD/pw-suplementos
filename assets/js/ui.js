import { categories } from "./filters.js";

export function renderCategories() {
  const desktopContainer = document.querySelector(".categories");
  const mobileContainer = document.querySelector(".mobile-menu");

  const createButtons = () => {
    return categories.map(cat => `
      <button data-category="${cat.id}">
        ${cat.label}
      </button>
    `).join("");
  };

  desktopContainer.innerHTML = createButtons();
  mobileContainer.innerHTML = createButtons();

  // Adiciona lógica de active nos botões
  // Ativa o primeiro botão ("Todos") por padrão
  desktopContainer.querySelector("[data-category]")?.classList.add("active");
  document.querySelectorAll(".categories button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

// ================= RENDER PRODUTOS =================
export function renderProducts(products) {

  const container =
    document.querySelector(
      ".products-grid"
    );

  container.innerHTML =
    products.map(product => `

      <div class="product-card">

        ${product.badge ? `

          <span class="
            product-badge
            ${product.badge}
          ">

            ${getBadgeText(
              product.badge
            )}

          </span>

        ` : ""}

        <div
          class="product-image"
          data-product-id="${product.id}"
        >

          <img
            src="${product.image}"
            alt="${product.name}"
          >

        </div>

        <div class="product-info">

          <span class="
            product-category
          ">

            ${product.category ?? ""}

          </span>

          <h3 class="
            product-name
          ">

            ${product.name}

          </h3>

          <div class="product-price-wrapper">

            ${product.oldPrice ? `

              <span class="
                old-price
              ">

                R$ ${formatPrice(product.oldPrice)}

              </span>

            ` : ""}

            <p class="
              product-price
            ">

              <span>R$</span>

              ${formatPrice(product.price)}

            </p>

          </div>

        </div>

        <button
          class="add-cart-btn"
          data-product-id="${product.id}"
        >

          Adicionar
          <i class="
            fa-solid
            fa-cart-shopping
          "></i>

        </button>

      </div>

    `).join("");

}


// ================= BADGE TEXT =================
function getBadgeText(badge) {

  switch (badge) {

    case "promo":
      return "Promoção";

    case "novo":
      return "Novo";

    case "destaque":
      return "Destaque";

    case "mais-vendido":
      return "Mais vendido";

    default:
      return "";

  }

}

// ================= MODAL PRODUTO =================
export function renderProductModal(product) {
  const modalContent = document.querySelector(".product-modal-content");

  modalContent.innerHTML = `
    <img src="${product.image}" alt="${product.name}">

    <div class="modal-info">
      <span class="modal-category">${product.category ?? ""}</span>
      <h2>${product.name}</h2>
      <p class="modal-description">${product.description ?? ""}</p>
      <p class="modal-price">R$ ${formatPrice(product.price)}</p>

      <button class="add-cart-btn" data-product-id="${product.id}">
        Adicionar <i class="fa-solid fa-cart-shopping"></i>
      </button>
    </div>
  `;
}

// ================= CONTADOR CARRINHO =================
export function updateCartCount(cart) {

  const cartCount = document.querySelector(".cart-count");

  const totalItems = cart.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  cartCount.textContent = totalItems;

}

// ================= RENDER CARRINHO =================
export function renderCart(cart) {

  const cartItems = document.querySelector(".cart-items");

  const cartTotal = document.querySelector(".cart-total");

  // CARRINHO VAZIO
  if (cart.length === 0) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Seu carrinho está vazio.
      </p>
    `;

    cartTotal.textContent = "0";

    return;

  }

  // RENDER ITENS
  cartItems.innerHTML = cart.map(item => `
    
    <div class="cart-item">

      <img src="${item.image}" alt="${item.name}">

      <div class="cart-item-info">

        <h4>${item.name}</h4>

        <p>R$ ${item.price}</p>

        <div class="cart-controls">

  <button 
    class="decrease-btn"
    data-product-id="${item.id}"
  >
    -
  </button>

  <span>${item.quantity}</span>

  <button 
    class="increase-btn"
    data-product-id="${item.id}"
  >
    +
  </button>

  <button 
    class="remove-btn"
    data-product-id="${item.id}"
  >
    <i class="fa-solid fa-trash"></i>
  </button>

</div>

      </div>

    </div>

  `).join("");

  // TOTAL
  const total = cart.reduce((accumulator, item) => {

    return accumulator + (item.price * item.quantity);

  }, 0);

  cartTotal.textContent = total.toFixed(2);

}

// ================= FORMATAR PREÇO =================
export function formatPrice(price) {

  if (!price) {

    return "0,00";

  }

  return Number(price)
    .toFixed(2)
    .replace(".", ",");

}