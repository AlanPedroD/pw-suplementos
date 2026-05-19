// ================= FIREBASE =================
import {
  auth
} from "./firebase.js";

import {
  signInWithEmailAndPassword,
  onAuthStateChanged          // <-- importado aqui
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";


// ================= ELEMENTOS =================
const loginForm = document.querySelector(".login-form");


// ================= REDIRECIONAR SE JÁ LOGADO =================
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../pages/admin.html";
  }
});


// ================= LOGIN =================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(loginForm);
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "../pages/admin.html";

  } catch (error) {
    console.error(error);
    alert("Email ou senha inválidos.");
  }
});