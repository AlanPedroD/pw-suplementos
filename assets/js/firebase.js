// ================= IMPORTS FIREBASE =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {

  getAuth

} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import { 
  getFirestore, 
  addDoc,
  collection,
  getDocs 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";




// ================= CONFIG FIREBASE =================
const firebaseConfig = {
    apiKey: "AIzaSyCJxhsc_Bbf_udzWNFtxPRvorg3lNgl1Js",
    authDomain: "loja-suplement.firebaseapp.com",
    projectId: "loja-suplement",
    storageBucket: "loja-suplement.firebasestorage.app",
    messagingSenderId: "1029710546676",
    appId: "1:1029710546676:web:33253592914a1a6ab540a1"
  };


// ================= INICIALIZAR =================
const app = initializeApp(firebaseConfig);


// ================= FIRESTORE =================
const db = getFirestore(app);
const auth = getAuth(app);


// ================= TESTE CRIAR PRODUTO =================
async function createTestProduct() {

  try {

    const docRef = await addDoc(
      collection(db, "products"),
      {

        name: "Whey Protein",

        category: "whey",

        price: 120,

        description: "Produto teste",

        image: "https://placehold.co/300"

      }
    );

    console.log(
      "Produto criado:",
      docRef.id
    );

  } catch (error) {

    console.error(error);

  }

}

// ================= BUSCAR PRODUTOS =================
async function getProducts() {

  try {

    const querySnapshot = await getDocs(
      collection(db, "products")
    );

    const products = [];

    querySnapshot.forEach((doc) => {

      products.push({

        id: doc.id,

        ...doc.data()

      });

    });

    return products;

  } catch (error) {

    console.error(error);

    return [];

  }

}
// ================= EXPORT =================
export {

  db,

  auth,

  getProducts

};