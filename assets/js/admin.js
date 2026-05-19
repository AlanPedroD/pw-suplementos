// ================= FIREBASE =================
import {
  db,
  auth
} from "./firebase.js";

import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


// ================= PROTEGER ADMIN =================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../pages/login.html";
  }
});


// ================= ELEMENTOS - PRODUTOS =================
const adminForm = document.querySelector(".admin-form");
const adminProducts = document.querySelector(".admin-products");
const imageInput = document.querySelector(".image-input");
const imagePreview = document.querySelector(".image-preview");

// ================= BADGE SELECT =================
const badgeSelect =
  document.querySelector(
    ".badge-select"
  );

const oldPriceWrapper =
  document.querySelector(
    ".old-price-wrapper"
  );

badgeSelect.addEventListener(
  "change",

  () => {

    if (
      badgeSelect.value === "promo"
    ) {

      oldPriceWrapper.style.display =
        "block";

    } else {

      oldPriceWrapper.style.display =
        "none";

    }

  }

);

// ================= ELEMENTOS - BANNERS =================
const bannerForm = document.querySelector(".banner-form");
const adminBanners = document.querySelector(".admin-banners");
const bannerDesktopInput = document.querySelector(".banner-desktop-input");
const bannerMobileInput = document.querySelector(".banner-mobile-input");
const bannerDesktopPreview = document.querySelector(".banner-desktop-preview");
const bannerMobilePreview = document.querySelector(".banner-mobile-preview");


// ================= ESTADO EDIÇÃO - PRODUTOS =================
let editingProductId = null;
let currentImageURL = null;

// ================= ESTADO EDIÇÃO - BANNERS =================
let editingBannerId = null;
let currentDesktopURL = null;
let currentMobileURL = null;


// ================= ABAS =================
const tabs = document.querySelectorAll(".admin-tab");
const sections = document.querySelectorAll(".admin-section");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    sections.forEach(s => s.classList.add("hidden"));

    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.remove("hidden");
  });
});


// ================= PREVIEW IMAGEM - PRODUTO =================
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.style.display = "block";
});

// ================= PREVIEW IMAGEM - BANNER DESKTOP =================
bannerDesktopInput.addEventListener("change", () => {
  const file = bannerDesktopInput.files[0];
  if (!file) return;
  bannerDesktopPreview.src = URL.createObjectURL(file);
  bannerDesktopPreview.style.display = "block";
});

// ================= PREVIEW IMAGEM - BANNER MOBILE =================
bannerMobileInput.addEventListener("change", () => {
  const file = bannerMobileInput.files[0];
  if (!file) return;
  bannerMobilePreview.src = URL.createObjectURL(file);
  bannerMobilePreview.style.display = "block";
});


// ================= LOGOUT =================
const logoutBtn = document.querySelector(".logout-btn");
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../pages/login.html";
});

// ================= VOLTAR À LOJA =================
const backBtn = document.querySelector(".back-btn");
backBtn.addEventListener("click", () => {
  window.location.href = "../index.html";
});


// ================= UPLOAD CLOUDINARY =================
async function uploadToCloudinary(file) {
  const cloudData = new FormData();
  cloudData.append("file", file);
  cloudData.append("upload_preset", "nova_loja_powernutri");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/ddojjqwky/image/upload",
    { method: "POST", body: cloudData }
  );

  const data = await response.json();
  return data.secure_url;
}


// ================= CRIAR/EDITAR PRODUTO =================
adminForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(adminForm);
  const imageFile = imageInput.files[0];
  let imageURL;

  try {
    if (imageFile) {
      imageURL = await uploadToCloudinary(imageFile);
    } else if (editingProductId) {
      imageURL = currentImageURL;
    } else {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    const product = {

  name:
    formData.get("name"),

  category:
    formData.get("category"),

  price:
    Number(
      formData.get("price")
    ),

  oldPrice:
  formData.get("oldPrice")
    ? Number(
        formData.get("oldPrice")
      )
    : null,

  description:
    formData.get("description"),

  badge:
    formData.get("badge"),

  image:
    imageURL

};


    if (editingProductId) {
      await updateDoc(doc(db, "products", editingProductId), product);
      alert("Produto atualizado!");
      editingProductId = null;
      currentImageURL = null;
      adminForm.querySelector("button").textContent = "Salvar produto";
    } else {
      await addDoc(collection(db, "products"), product);
      alert("Produto criado!");
    }

    adminForm.reset();
    imagePreview.src = "";
    imagePreview.style.display = "none";
    loadProducts();

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar produto.");
  }
});


// ================= CRIAR/EDITAR BANNER =================
bannerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(bannerForm);
  const desktopFile = bannerDesktopInput.files[0];
  const mobileFile = bannerMobileInput.files[0];

  let desktopURL;
  let mobileURL;

  try {
    // ===== IMAGEM DESKTOP =====
    if (desktopFile) {
      desktopURL = await uploadToCloudinary(desktopFile);
    } else if (editingBannerId) {
      desktopURL = currentDesktopURL;
    } else {
      alert("Por favor, selecione a imagem desktop.");
      return;
    }

    // ===== IMAGEM MOBILE =====
    if (mobileFile) {
      mobileURL = await uploadToCloudinary(mobileFile);
    } else if (editingBannerId) {
      mobileURL = currentMobileURL;
    } else {
      alert("Por favor, selecione a imagem mobile.");
      return;
    }

    const banner = {
      imageDesktop: desktopURL,
      imageMobile: mobileURL,
      category: formData.get("category"),
      order: Number(formData.get("order"))
    };

    if (editingBannerId) {
      await updateDoc(doc(db, "banners", editingBannerId), banner);
      alert("Banner atualizado!");
      editingBannerId = null;
      currentDesktopURL = null;
      currentMobileURL = null;
      bannerForm.querySelector("button").textContent = "Salvar banner";
    } else {
      await addDoc(collection(db, "banners"), banner);
      alert("Banner criado!");
    }

    bannerForm.reset();
    bannerDesktopPreview.src = "";
    bannerDesktopPreview.style.display = "none";
    bannerMobilePreview.src = "";
    bannerMobilePreview.style.display = "none";
    loadBanners();

  } catch (error) {
    console.error(error);
    alert("Erro ao salvar banner.");
  }
});


// ================= LISTAR PRODUTOS =================
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let productsHTML = "";

    querySnapshot.forEach((doc) => {
      const product = { id: doc.id, ...doc.data() };

      productsHTML += `
        <div class="admin-product-card">
          <img src="${product.image}" alt="${product.name}">
          <div class="admin-product-info">
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <strong>R$ ${product.price}</strong>
          </div>
          <div class="admin-product-actions">
            <button class="edit-btn" data-id="${product.id}">Editar</button>
            <button class="delete-btn" data-id="${product.id}">Excluir</button>
          </div>
        </div>
      `;
    });

    adminProducts.innerHTML = productsHTML;

  } catch (error) {
    console.error(error);
  }
}

loadProducts();


// ================= LISTAR BANNERS =================
async function loadBanners() {
  try {
    const q = query(collection(db, "banners"), orderBy("order"));
    const querySnapshot = await getDocs(q);
    let bannersHTML = "";

    querySnapshot.forEach((doc) => {
      const banner = { id: doc.id, ...doc.data() };

      bannersHTML += `
        <div class="admin-banner-card">
          <div class="admin-banner-images">
            <div class="admin-banner-img-wrap">
              <span>Desktop</span>
              <img src="${banner.imageDesktop}" alt="Banner Desktop">
            </div>
            <div class="admin-banner-img-wrap">
              <span>Mobile</span>
              <img src="${banner.imageMobile}" alt="Banner Mobile">
            </div>
          </div>
          <div class="admin-product-info">
            <p>Categoria: <strong>${banner.category}</strong></p>
            <p>Ordem: <strong>${banner.order}</strong></p>
          </div>
          <div class="admin-product-actions">
            <button class="edit-banner-btn" data-id="${banner.id}">Editar</button>
            <button class="delete-banner-btn" data-id="${banner.id}">Excluir</button>
          </div>
        </div>
      `;
    });

    adminBanners.innerHTML = bannersHTML || "<p style='color:var(--muted)'>Nenhum banner cadastrado.</p>";

  } catch (error) {
    console.error(error);
  }
}

loadBanners();


// ================= EXCLUIR PRODUTO =================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const productId = e.target.dataset.id;
    if (!confirm("Deseja excluir este produto?")) return;

    try {
      await deleteDoc(doc(db, "products", productId));
      loadProducts();
      alert("Produto excluído!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir.");
    }
  }
});


// ================= EXCLUIR BANNER =================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-banner-btn")) {
    const bannerId = e.target.dataset.id;
    if (!confirm("Deseja excluir este banner?")) return;

    try {
      await deleteDoc(doc(db, "banners", bannerId));
      loadBanners();
      alert("Banner excluído!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir banner.");
    }
  }
});


// ================= EDITAR PRODUTO =================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const productId = e.target.dataset.id;

    try {
      const querySnapshot = await getDocs(collection(db, "products"));

      querySnapshot.forEach((docItem) => {
        if (docItem.id === productId) {
          const product = docItem.data();

          adminForm.name.value = product.name;
          adminForm.category.value = product.category;
          adminForm.price.value = product.price;
          adminForm.description.value = product.description;

          // BADGE
badgeSelect.value =
  product.badge || "";

// PREÇO ANTIGO
adminForm.oldPrice.value =
  product.oldPrice || "";

// MOSTRAR CAMPO PROMO
if (product.badge === "promo") {

  oldPriceWrapper.style.display =
    "block";

} else {

  oldPriceWrapper.style.display =
    "none";

}

          currentImageURL = product.image;
          imagePreview.src = product.image;
          imagePreview.style.display = "block";

          editingProductId = productId;
          adminForm.querySelector("button").textContent = "Atualizar produto";

          // Garante que a aba de produtos está ativa
          tabs.forEach(t => t.classList.remove("active"));
          sections.forEach(s => s.classList.add("hidden"));
          document.querySelector('[data-tab="products"]').classList.add("active");
          document.getElementById("tab-products").classList.remove("hidden");

          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

    } catch (error) {
      console.error(error);
    }
  }
});


// ================= EDITAR BANNER =================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("edit-banner-btn")) {
    const bannerId = e.target.dataset.id;

    try {
      const querySnapshot = await getDocs(collection(db, "banners"));

      querySnapshot.forEach((docItem) => {
        if (docItem.id === bannerId) {
          const banner = docItem.data();

          bannerForm.querySelector(".banner-category").value = banner.category;
          bannerForm.querySelector(".banner-order").value = banner.order;

          currentDesktopURL = banner.imageDesktop;
          currentMobileURL = banner.imageMobile;

          bannerDesktopPreview.src = banner.imageDesktop;
          bannerDesktopPreview.style.display = "block";

          bannerMobilePreview.src = banner.imageMobile;
          bannerMobilePreview.style.display = "block";

          editingBannerId = bannerId;
          bannerForm.querySelector("button").textContent = "Atualizar banner";

          // Garante que a aba de banners está ativa
          tabs.forEach(t => t.classList.remove("active"));
          sections.forEach(s => s.classList.add("hidden"));
          document.querySelector('[data-tab="banners"]').classList.add("active");
          document.getElementById("tab-banners").classList.remove("hidden");

          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });

    } catch (error) {
      console.error(error);
    }
  }
});
