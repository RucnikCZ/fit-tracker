// ============================================================
//  FIREBASE KONFIGURACE
//  1. Jdi na console.firebase.google.com
//  2. Vyber svůj projekt → Project settings → Your apps → Web app
//  3. Zkopíruj celý firebaseConfig objekt a vlož ho sem
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================================
//  VLOŽ SEM SVŮJ firebaseConfig (zkopíruj z Firebase Console)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyBTWroD3jZDd132bE7SDu-hDddFwQ4azMs",
    authDomain: "fittracker-bb096.firebaseapp.com",
    projectId: "fittracker-bb096",
    storageBucket: "fittracker-bb096.firebasestorage.app",
    messagingSenderId: "284356350621",
    appId: "1:284356350621:web:32a2cc4550621a841a3a74",
    measurementId: "G-BSS5GSTE3N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Offline persistence: více záložek otevřeno najednou");
  } else if (err.code === 'unimplemented') {
    console.warn("Offline persistence není v tomto prohlížeči podporována");
  }
});
