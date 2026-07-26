/* ==========================================================================
   SplendyCraft product store
   products-data.js is the seed catalog. Admin changes are saved in one shared
   browser-side source so every page reads the same live product list.
   ========================================================================== */
import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

(function(){
  const STORAGE_KEY = 'splendycraft.products.v1';
  const CHANGE_EVENT = 'splendy-products-changed';
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel(CHANGE_EVENT) : null;

  function seedProducts(){
    try {
      if (typeof SPLENDY_PRODUCTS !== 'undefined' && Array.isArray(SPLENDY_PRODUCTS)) {
        return normalizeProducts(SPLENDY_PRODUCTS);
      }
    } catch (error) {
      return [];
    }
    return [];
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeProducts(products){
    return products.map(normalizeProduct).filter(product => product.id && product.name);
  }

  function normalizeProduct(product){
    const safe = product || {};
    return {
      id: String(safe.id || slugify(safe.name || 'product')),
      name: String(safe.name || '').trim(),
      category: String(safe.category || '').trim(),
      shortDescription: String(safe.shortDescription || '').trim(),
      longDescription: String(safe.longDescription || '').trim(),
      images: Array.isArray(safe.images) ? safe.images.filter(Boolean).map(String) : [],
      material: String(safe.material || '').trim(),
      dimensions: String(safe.dimensions || '').trim(),
      color: String(safe.color || '').trim(),
      craftsmanship: String(safe.craftsmanship || '').trim(),
      care: String(safe.care || '').trim(),
      availability: String(safe.availability || '').trim()
    };
  }

async all() {

    const snapshot = await getDocs(productsCollection);

    return snapshot.docs.map(doc => ({
        firestoreId: doc.id,
        ...doc.data()
    }));

}

  function saveProducts(products){
    const normalized = normalizeProducts(products);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    announceChange(normalized);
    return clone(normalized);
  }

  function announceChange(products){
    const detail = { products: clone(products) };
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }));
    if (channel) channel.postMessage(detail);
  }

  function slugify(value){
    const slug = String(value || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || 'product';
  }

  function uniqueId(name, products, currentId){
    const base = slugify(name);
    const existing = new Set(products.map(product => product.id).filter(id => id !== currentId));
    let id = base;
    let index = 2;

    while (existing.has(id)) {
      id = `${base}-${index}`;
      index += 1;
    }

    return id;
  }

  function all(){
    return clone(loadProducts());
  }

async find(id) {

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

  function categories(){
    return [...new Set(all().map(product => product.category).filter(Boolean))].sort();
  }



async add(product) {

    const docRef = await addDoc(
        productsCollection,
        product
    );

    return docRef.id;

}

    return {
        firestoreId: docRef.id,
        ...normalized
    };
}
async update(firestoreId, product) {

    await updateDoc(
        doc(db, "products", firestoreId),
        product
    );

}

async remove(firestoreId) {

    await deleteDoc(
        doc(db, "products", firestoreId)
    );

}

  function onChange(callback){
    const handler = event => {
      if (event.key && event.key !== STORAGE_KEY) return;
      callback(all());
    };
    const customHandler = event => callback(clone(event.detail.products));
    const channelHandler = event => callback(clone(event.data.products));

    window.addEventListener('storage', handler);
    window.addEventListener(CHANGE_EVENT, customHandler);
    if (channel) channel.addEventListener('message', channelHandler);

    return function unsubscribe(){
      window.removeEventListener('storage', handler);
      window.removeEventListener(CHANGE_EVENT, customHandler);
      if (channel) channel.removeEventListener('message', channelHandler);
    };
  }

  function reset(){
    window.localStorage.removeItem(STORAGE_KEY);
    announceChange(seedProducts());
  }

  window.SplendyProductStore = {
    all,
    find,
    categories,
    add,
    update,
    remove,
    onChange,
    slugify,
    reset
  };
})();
