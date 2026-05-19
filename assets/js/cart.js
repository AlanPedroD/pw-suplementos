// ================= ESTADO INICIAL =================
export let cart = JSON.parse(
  localStorage.getItem("cart")
) || [];


// ================= ADICIONAR ITEM =================
export function addToCart(product) {

  const existingProduct = cart.find(
    item => item.id === product.id
  );

  // PRODUTO JÁ EXISTE
  if (existingProduct) {

    existingProduct.quantity += 1;

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }
  saveCart();

}

// ================= AUMENTAR QUANTIDADE =================
export function increaseQuantity(productId) {

  const product = cart.find(
    item => item.id === productId
  );

  if (product) {
    product.quantity += 1;
  }

  saveCart();

}


// ================= DIMINUIR QUANTIDADE =================
export function decreaseQuantity(productId) {

  const product = cart.find(
    item => item.id === productId
  );

  if (!product) return;

  // NÃO DIMINUI SE JÁ ESTIVER EM 1
  if (product.quantity <= 1) return;

  product.quantity -= 1;

  saveCart();

}


// ================= REMOVER ITEM =================
export function removeFromCart(productId) {

  const updatedCart = cart.filter(
    item => item.id !== productId
  );

  cart.length = 0;

  cart.push(...updatedCart);

  saveCart();

}

// ================= SALVAR CARRINHO =================
export function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

}

// ================= LIMPAR CARRINHO =================
export function clearCart() {

  cart.length = 0;

  saveCart();

}