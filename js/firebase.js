import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKVPApIecxUANu_ceuaoqXbn7bWhkEato",
  authDomain: "splendycraft-admin-page.firebaseapp.com",
  projectId: "splendycraft-admin-page",
  storageBucket: "splendycraft-admin-page.firebasestorage.app",
  messagingSenderId: "959234187077",
  appId: "1:959234187077:web:95878444396f439248a82c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
