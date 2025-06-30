let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = localStorage.getItem("currentUser") || null;
let isGuest = localStorage.getItem("guest") === "true";
let documents = JSON.parse(localStorage.getItem("documents")) || [];

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("documents", JSON.stringify(documents));
}

function register() {
  const user = document.getElementById("regUser").value;
  const pass = document.getElementById("regPass").value;
  if (!user || !pass) return alert("Tüm alanları doldurun.");
  if (users.find(u => u.username === user)) return alert("Bu kullanıcı zaten var.");
  users.push({ username: user, password: pass });
  saveData();
  alert("Kayıt başarılı. Şimdi giriş yapabilirsiniz.");
}

function login() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;
  const found = users.find(u => u.username === user && u.password === pass);
  if (!found) return alert("Hatalı kullanıcı adı veya şifre.");
  currentUser = user;
  localStorage.setItem("currentUser", currentUser);
  isGuest = false;
  localStorage.setItem("guest", "false");
  initApp();
}

function proceedAsGuest() {
  isGuest = true;
  currentUser = null;
  localStorage.setItem("guest", "true");
  localStorage.removeItem("currentUser");
  initApp();
}

function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("guest");
  location.reload();
}

function initApp() {
  document.querySelector(".hero").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  // Form görünümü showSection fonksiyonunda kontrol ediliyor
  showSection("anasayfa"); // Site açıldığında direkt ana sayfa açılır
  renderDocs();
}

function showSection(id) {
  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";

  // Evrak ekleme formu sadece ana sayfada ve giriş yapan kullanıcı için gösterilir
  if (!isGuest && id === "anasayfa") {
    document.getElementById("addDocForm").style.display = "block";
  } else {
    document.getElementById("addDocForm").style.display = "none";
  }

  renderDocs();
}

function addNewDoc() {
  if (isGuest) {
    alert("Evrak eklemek için giriş yapmalısınız.");
    return;
  }

  const name = document.getElementById("newName").value;
  const dept = document.getElementById("newDept").value;
  const file = document.getElementById("newFile").value;

  if (!name || !dept || !file) return alert("Tüm alanlar zorunludur.");

  documents.push({ name, department: dept, file, status: null, archived: false });
  saveData();
  document.getElementById("newName").value = "";
  document.getElementById("newDept").value = "";
  document.getElementById("newFile").value = "";
  renderDocs();
}

function renderDocs() {
  const gelen = document.getElementById("gelen");
  const onay = document.getElementById("onay");
  const red = document.getElementById("red");
  const bekle = document.getElementById("beklemede");
  const arsiv = document.getElementById("arsiv");

  gelen.innerHTML = "<h3>Gelen Evraklar</h3>";
  onay.innerHTML = "<h3>Onaylananlar</h3>";
  red.innerHTML = "<h3>Reddedilenler</h3>";
  bekle.innerHTML = "<h3>Beklemede</h3>";
  arsiv.innerHTML = "<h3>Arşiv</h3>";

  documents.forEach((doc, i) => {
    const box = document.createElement("div");
    box.className = "doc-box";
    box.innerHTML = `
      <strong>${doc.name}</strong><br>
      Departman: ${doc.department}<br>
      Dosya: <a href="${doc.file}" target="_blank">${doc.file}</a><br>
    `;

    if (!doc.status && !doc.archived) {
      if (!isGuest) {
        box.innerHTML += `
          <button onclick="setStatus(${i}, 'onaylandı')">Onayla</button>
          <button onclick="setStatus(${i}, 'reddedildi')">Reddet</button>
          <button onclick="setStatus(${i}, 'beklemede')">Beklemeye Al</button>
        `;
      }
      gelen.appendChild(box);

    } else if (doc.status === "onaylandı" && !doc.archived) {
      box.classList.add("onay");
      if (!isGuest) box.innerHTML += `<button onclick="archiveDoc(${i})">Arşivle</button><button onclick="deleteDoc(${i})">Sil</button>`;
      onay.appendChild(box);

    } else if (doc.status === "reddedildi" && !doc.archived) {
      box.classList.add("red");
      if (!isGuest) box.innerHTML += `<button onclick="archiveDoc(${i})">Arşivle</button><button onclick="deleteDoc(${i})">Sil</button>`;
      red.appendChild(box);

    } else if (doc.status === "beklemede" && !doc.archived) {
      box.classList.add("bekle");
      if (!isGuest) {
        box.innerHTML += `
          <button onclick="setStatus(${i}, 'onaylandı')">Onayla</button>
          <button onclick="setStatus(${i}, 'reddedildi')">Reddet</button>
          <button onclick="archiveDoc(${i})">Arşivle</button>
          <button onclick="deleteDoc(${i})">Sil</button>
        `;
      }
      bekle.appendChild(box);

    } else if (doc.archived) {
      box.classList.add("arsiv");
      if (!isGuest) box.innerHTML += `<button onclick="unarchiveDoc(${i})">Geri Al</button><button onclick="deleteDoc(${i})">Sil</button>`;
      arsiv.appendChild(box);
    }
  });
}

function setStatus(index, status) {
  documents[index].status = status;
  saveData();
  renderDocs();
}

function archiveDoc(index) {
  documents[index].archived = true;
  saveData();
  renderDocs();
}

function unarchiveDoc(index) {
  documents[index].archived = false;
  saveData();
  renderDocs();
}

function deleteDoc(index) {
  if (isGuest) {
    alert("Evrak silmek için giriş yapmalısınız.");
    return;
  }
  if (confirm("Silmek istediğinizden emin misiniz?")) {
    documents.splice(index, 1);
    saveData();
    renderDocs();
  }
}

window.onload = () => {
  if (currentUser || isGuest) {
    initApp();
  } else {
    document.querySelector(".hero").style.display = "block";
    document.getElementById("mainContent").style.display = "none";
  }
};
