// firebase-config.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzQUYZnIDIco_SHCMI_MmGQIeBnQdjxzo",
  authDomain: "login-37063.firebaseapp.com",
  projectId: "login-37063",
  storageBucket: "login-37063.firebasestorage.app",
  messagingSenderId: "85321873353",
  appId: "1:85321873353:web:cc758c0ef336e0742c1a18",
  measurementId: "G-1HNENVH00P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
