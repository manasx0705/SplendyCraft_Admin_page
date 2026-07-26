// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKVPApIecxUANu_ceuaoqXbn7bWhkEato",
  authDomain: "splendycraft-admin-page.firebaseapp.com",
  projectId: "splendycraft-admin-page",
  storageBucket: "splendycraft-admin-page.firebasestorage.app",
  messagingSenderId: "959234187077",
  appId: "1:959234187077:web:95878444396f439248a82c",
  measurementId: "G-EC73SF5SJN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
