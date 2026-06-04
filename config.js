// ============================================================
//  FIREBASE KONFIGURACE
//  1. Jdi na console.firebase.google.com
//  2. Vyber svůj projekt → Project settings → Your apps → Web app
//  3. Zkopíruj celý firebaseConfig objekt a vlož ho sem
// ============================================================

const firebaseConfig = {
  apiKey: "VLOZ_SEM_API_KEY",
  authDomain: "VLOZ_SEM_AUTH_DOMAIN",
  projectId: "VLOZ_SEM_PROJECT_ID",
  storageBucket: "VLOZ_SEM_STORAGE_BUCKET",
  messagingSenderId: "VLOZ_SEM_MESSAGING_SENDER_ID",
  appId: "VLOZ_SEM_APP_ID"
};

// ============================================================
//  NASTAVENÍ FIREBASE SERVICES
//  Neměň nic níže, pokud nevíš co děláš
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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
