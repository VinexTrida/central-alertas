import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtdmOyEvoTuUxEn8X9RUaKEUWlyI27JN0",
  authDomain: "site-filtro-de-noticias.firebaseapp.com",
  projectId: "site-filtro-de-noticias",
  storageBucket: "site-filtro-de-noticias.firebasestorage.app",
  messagingSenderId: "158976941437",
  appId: "1:158976941437:web:9ba6e259b71d30ba6d8014",
  measurementId: "G-8HPF45G7M3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export {
  db,
  auth,
  collection,
  getDocs,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  signInAnonymously,
  onAuthStateChanged,
  addDoc
};