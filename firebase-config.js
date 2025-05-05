// Ganti dengan konfigurasi Firebase milikmu dari Firebase Console
const firebaseConfig = {
 apiKey: "AIzaSyCZqQGh2kXFZ7ARcJi3mD-kXYGhysqet2Y",
  authDomain: "qrpatrolv2.firebaseapp.com",
  projectId: "qrpatrolv2",
  storageBucket: "qrpatrolv2.firebasestorage.app",
  messagingSenderId: "910596893170",
  appId: "1:910596893170:web:c44ae1335d0f2b8f6fe36b",
  measurementId: "G-JKWLJH0CP4"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
