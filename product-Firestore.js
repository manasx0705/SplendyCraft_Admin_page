import { db } from "./js/firebase.js";

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  where
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const productsCollection = collection(db, "products");

function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "product";
}

function getString(formData, key) {
  return String(formData.get(key) || "").trim();
}

function normalizeProduct(product) {
  const safe = product || {};

  return {
    id: String(safe.id || toSlug(safe.name || "product")),
    name: String(safe.name || "").trim(),
    category: String(safe.category || "").trim(),
    shortDescription: String(safe.shortDescription || "").trim(),
    longDescription: String(safe.longDescription || "").trim(),
    images: Array.isArray(safe.images) ? safe.images.filter(Boolean).map(String) : [],
    material: String(safe.material || "").trim(),
    dimensions: String(safe.dimensions || "").trim(),
    color: String(safe.color || "").trim(),
    craftsmanship: String(safe.craftsmanship || "").trim(),
    care: String(safe.care || "").trim(),
    availability: String(safe.availability || "").trim()
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!(file instanceof File) || file.size === 0) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

async function getImagesFromFormData(formData) {
  let existingImages = [];

  try {
    existingImages = JSON.parse(formData.get("existingImages") || "[]");
  } catch (error) {
    existingImages = [];
  }

  const imageFiles = formData
    .getAll("images")
    .filter(file => file instanceof File && file.size > 0);

  const newImages = (await Promise.all(imageFiles.map(fileToDataUrl))).filter(Boolean);

  return [
    ...existingImages.filter(Boolean).map(String),
    ...newImages
  ];
}

async function productFromFormData(formData, existingId) {
  return normalizeProduct({
    id: getString(formData, "id") || existingId || toSlug(getString(formData, "name")),
    name: getString(formData, "name"),
    category: getString(formData, "category"),
    shortDescription: getString(formData, "shortDescription"),
    longDescription: getString(formData, "longDescription"),
    images: await getImagesFromFormData(formData),
    material: getString(formData, "material"),
    dimensions: getString(formData, "dimensions"),
    color: getString(formData, "color"),
    craftsmanship: getString(formData, "craftsmanship"),
    care: getString(formData, "care"),
    availability: getString(formData, "availability")
  });
}

async function findProductDocRef(identifier) {
  const directRef = doc(db, "products", identifier);
  const directSnapshot = await getDoc(directRef);

  if (directSnapshot.exists()) {
    return directRef;
  }

  const productQuery = query(productsCollection, where("id", "==", identifier));
  const querySnapshot = await getDocs(productQuery);

  if (querySnapshot.empty) {
    throw new Error(`Product "${identifier}" was not found in Firestore.`);
  }

  return querySnapshot.docs[0].ref;
}

async function getProducts() {
  const snapshot = await getDocs(productsCollection);

  return snapshot.docs.map(document => ({
    firestoreId: document.id,
    ...document.data()
  }));
}

async function createProduct(formData) {
  const product = await productFromFormData(formData);

  const docRef = await addDoc(productsCollection, {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return {
    firestoreId: docRef.id,
    ...product
  };
}

async function updateProduct(id, formData) {
  const productRef = await findProductDocRef(id);
  const product = await productFromFormData(formData, id);

  await updateDoc(productRef, {
    ...product,
    updatedAt: serverTimestamp()
  });

  return {
    firestoreId: productRef.id,
    ...product
  };
}

async function deleteProduct(id) {
  const productRef = await findProductDocRef(id);
  await deleteDoc(productRef);

  return { id };
}

function getCategories(products) {
  if (!Array.isArray(products)) return [];

  return [
    ...new Set(products.map(product => product.category).filter(Boolean))
  ].sort();
}

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
async function testFirestore() {
    const docRef = await addDoc(productsCollection, {
        id: "test-product",
        name: "Test Product",
        category: "Testing",
        shortDescription: "Testing",
        longDescription: "Testing Firestore",
        images: [],
        material: "Wood",
        dimensions: "10 × 10 cm",
        color: "Brown",
        craftsmanship: "Handmade",
        care: "Keep dry",
        availability: "Available"
    });

    console.log("Created:", docRef.id);
}

testFirestore();
