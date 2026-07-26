import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {

    signInWithEmailAndPassword

} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;

    try {

        await signInWithEmailAndPassword(auth, email, password);

        window.location.href = "admin.html";

    } catch (error) {

        document.getElementById("error").textContent =
            "Invalid email or password.";

    }

});
