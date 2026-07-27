import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const productsCollection = collection(db, "products");

(function () {

    function slugify(value) {
        const slug = String(value || "")
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        return slug || "product";
    }

    function normalizeProduct(product) {
        const safe = product || {};

        return {
            id: String(safe.id || slugify(safe.name || "product")),
            name: String(safe.name || "").trim(),
            category: String(safe.category || "").trim(),
            shortDescription: String(safe.shortDescription || "").trim(),
            longDescription: String(safe.longDescription || "").trim(),
            images: Array.isArray(safe.images)
                ? safe.images.filter(Boolean).map(String)
                : [],
            material: String(safe.material || "").trim(),
            dimensions: String(safe.dimensions || "").trim(),
            color: String(safe.color || "").trim(),
            craftsmanship: String(safe.craftsmanship || "").trim(),
            care: String(safe.care || "").trim(),
            availability: String(safe.availability || "").trim()
        };
    }

    async function all() {

        const snapshot = await getDocs(productsCollection);

        return snapshot.docs.map(document => ({
            firestoreId: document.id,
            ...document.data()
        }));
    }

    async function find(id) {

        const q = query(
            productsCollection,
            where("id", "==", id)
        );

        const snapshot = await getDocs(q);

        if (snapshot.empty) return null;

        const document = snapshot.docs[0];

        return {
            firestoreId: document.id,
            ...document.data()
        };
    }

    async function add(product) {

        const normalized = normalizeProduct(product);

        const docRef = await addDoc(
            productsCollection,
            normalized
        );

        return {
            firestoreId: docRef.id,
            ...normalized
        };
    }

    async function update(firestoreId, product) {

        await updateDoc(
            doc(db, "products", firestoreId),
            normalizeProduct(product)
        );
    }

    async function remove(firestoreId) {

        await deleteDoc(
            doc(db, "products", firestoreId)
        );
    }

    async function categories() {

        const products = await all();

        return [
            ...new Set(
                products
                    .map(product => product.category)
                    .filter(Boolean)
            )
        ].sort();
    }

    window.SplendyProductStore = {
        all,
        find,
        add,
        update,
        remove,
        categories,
        slugify
    };

})();
