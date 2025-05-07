const loginSection = document.getElementById("login-section");
const userSection = document.getElementById("user-section");
const userEmail = document.getElementById("user-email");
const scanner = document.getElementById("scanner");

firebase.auth.onAuthStateChanged(user => {
  if (user) {
    loginSection.classList.add("hidden");
    userSection.classList.remove("hidden");
    scanner.classList.remove("hidden");
    userEmail.textContent = `Logged in as ${user.email}`;
  } else {
    loginSection.classList.remove("hidden");
    userSection.classList.add("hidden");
    scanner.classList.add("hidden");
  }
});

window.login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await firebase.signInWithEmailAndPassword(firebase.auth, email, password);
  } catch (error) {
    alert("Login failed: " + error.message);
  }
};

window.logout = () => {
  firebase.signOut(firebase.auth);
};

window.startScan = () => {
  const qrReader = new Html5Qrcode("qr-reader");
  qrReader.start({ facingMode: "environment" }, {
    fps: 10,
    qrbox: 250
  }, async (decodedText) => {
    qrReader.stop();
    const position = await getLocation();
    await firebase.addDoc(firebase.collection(firebase.db, "patrol_logs"), {
      user: firebase.auth.currentUser.email,
      qr: decodedText,
      time: firebase.serverTimestamp(),
      location: position
    });
    alert("Patrol recorded!");
  }, error => {
    console.warn(error);
  });
};

async function getLocation() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      }),
      err => resolve({ lat: null, lng: null })
    );
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("login-btn").addEventListener("click", login);
  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("start-btn").addEventListener("click", startScan);
});

