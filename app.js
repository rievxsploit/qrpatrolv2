document.addEventListener("DOMContentLoaded", () => {
  const loginScreen = document.getElementById("login-screen");
  const dashboard = document.getElementById("dashboard");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const loginError = document.getElementById("login-error");
  const toggleFlashBtn = document.getElementById("toggle-flash");
  const scanLog = document.getElementById("scan-log");
  const exportBtn = document.getElementById("export-btn");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  let html5QrCode;
  let flashOn = false;

  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      loginError.classList.remove("hidden");
    }
  });

  logoutBtn.addEventListener("click", () => {
    auth.signOut();
  });

  toggleFlashBtn.addEventListener("click", async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.applyVideoConstraints({
          advanced: [{ torch: !flashOn }]
        });
        flashOn = !flashOn;
      } catch (e) {
        alert("Flash tidak didukung pada perangkat ini.");
      }
    }
  });

  exportBtn.addEventListener("click", async () => {
    const start = startDateInput.value;
    const end = endDateInput.value;
    if (!start || !end) return alert("Isi tanggal awal dan akhir");

    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const snapshot = await db.collection("scanLogs")
      .where("user", "==", auth.currentUser.uid)
      .where("timestamp", ">=", startDate)
      .where("timestamp", "<=", endDate)
      .orderBy("timestamp", "asc")
      .get();

    const rows = ["QR Data,Latitude,Longitude,Timestamp"];
    snapshot.forEach(doc => {
      const d = doc.data();
      const t = d.timestamp?.toDate().toISOString() ?? "";
      const row = `"${d.qrData}",${d.location.latitude},${d.location.longitude},${t}`;
      rows.push(row);
    });

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qrpatrol_${start}_${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  auth.onAuthStateChanged((user) => {
    if (user) {
      loginScreen.classList.add("hidden");
      dashboard.classList.remove("hidden");
      startScanner();
      loadLogs(user.uid);
    } else {
      loginScreen.classList.remove("hidden");
      dashboard.classList.add("hidden");
      if (html5QrCode) {
        html5QrCode.stop();
      }
    }
  });

  async function startScanner() {
    html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: 250 }; // Optional config
    try {
      const devices = await Html5Qrcode.getCameras();
      const backCamera = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

      await html5QrCode.start(
        backCamera.id,
        config,
        async (decodedText) => {
          await handleScan(decodedText);
        }
      );
    } catch (err) {
      alert("Gagal mengakses kamera: " + err);
    }
  }

  async function handleScan(qrData) {
    html5QrCode.pause();
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung browser ini.");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const log = {
        user: auth.currentUser.uid,
        qrData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        location: { latitude, longitude }
      };
      await db.collection("scanLogs").add(log);
      renderLog(log);
      html5QrCode.resume();
    }, (error) => {
      alert("Gagal mendapatkan lokasi: " + error.message);
      html5QrCode.resume();
    });
  }

  function renderLog(log) {
    const li = document.createElement("li");
    li.className = "bg-white p-3 rounded shadow text-sm";
    li.textContent = `${log.qrData} | Lat: ${log.location.latitude}, Lng: ${log.location.longitude}`;
    scanLog.prepend(li);
  }

  async function loadLogs(uid) {
    const snapshot = await db.collection("scanLogs")
      .where("user", "==", uid)
      .orderBy("timestamp", "desc")
      .limit(20)
      .get();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.location) renderLog(data);
    });
  }
});
