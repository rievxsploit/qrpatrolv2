// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZqQGh2kXFZ7ARcJi3mD-kXYGhysqet2Y",
  authDomain: "qrpatrolv2.firebaseapp.com",
  projectId: "qrpatrolv2",
  storageBucket: "qrpatrolv2.firebasestorage.app",
  messagingSenderId: "910596893170",
  appId: "1:910596893170:web:c44ae1335d0f2b8f6fe36b",
  measurementId: "G-JKWLJH0CP4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebase = { auth, db, signInWithEmailAndPassword, onAuthStateChanged, signOut, collection, addDoc, serverTimestamp };
