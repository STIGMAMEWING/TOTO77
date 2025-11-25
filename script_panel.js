// script_panel.js

// --- Bagian Umum/Utilities ---
const ADMIN_USER = "admin";
const ADMIN_PASS = "123456"; // SIMULASI PASSWORD ADMIN

function getAllUsers() {
    const users = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        // Mengambil semua kunci yang bukan untuk status login admin/user
        if (key !== 'activeUser' && key !== 'adminLoggedIn') {
            users[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    return users;
}

function saveUser(username, userData) {
    localStorage.setItem(username, JSON.stringify(userData));
}

function getUser(username) {
    const userData = localStorage.getItem(username);
    return userData ? JSON.parse(userData) : null;
}

function formatRupiah(number) {
    return 'IDR ' + new Intl.NumberFormat('id-ID').format(number);
}

// --- Bagian Login Admin ---
function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_USER && password === ADMIN_PASS) {
        localStorage.setItem('adminLoggedIn', 'true');
        alert("Admin Login Berhasil!");
        window.location.href = "DashboardPanel.html";
    } else {
        alert("Admin Login Gagal: Username atau Password salah.");
    }
}

// --- Bagian Admin Auth & Logout ---
function checkAdminAuth() {
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        alert("Akses Ditolak: Silakan Login Admin.");
        window.location.href = "Login.html";
        return false;
    }
    return true;
}

function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    alert("Admin Logout Berhasil.");
    window.location.href = "Login.html";
}

// --- Bagian Dashboard Admin ---
function loadDashboardUsers() {
    if (!checkAdminAuth()) return;

    const users = getAllUsers();
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    for (const [username, user] of Object.entries(users)) {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = username;
        row.insertCell(1).textContent = user.email || '-';
        row.insertCell(2).textContent = formatRupiah(user.simulated_balance || 0);
        row.insertCell(3).textContent = user.registration_date || 'N/A';
    }
}

// --- Bagian Deposit (Tambah Saldo) ---
function handleDepositPanel(e) {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const username = document.getElementById('depositUsername').value.trim();
    const amount = parseInt(document.getElementById('depositAmount').value);
    
    let userData = getUser(username);

    if (!userData) {
        alert("Gagal: Nama Pengguna tidak ditemukan.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Gagal: Jumlah deposit tidak valid.");
        return;
    }

    userData.simulated_balance = (userData.simulated_balance || 0) + amount;
    saveUser(username, userData);

    alert(`SUKSES! Saldo ${username} telah ditambahkan ${formatRupiah(amount)}. Saldo baru: ${formatRupiah(userData.simulated_balance)}.`);
    
    document.getElementById('depositFormPanel').reset();
}

// --- Bagian Withdraw (Kurangi Saldo) ---
function handleWithdrawPanel(e) {
    e.preventDefault();
    if (!checkAdminAuth()) return;
    
    const username = document.getElementById('withdrawUsername').value.trim();
    const amount = parseInt(document.getElementById('withdrawAmount').value);
    
    let userData = getUser(username);

    if (!userData) {
        alert("Gagal: Nama Pengguna tidak ditemukan.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Gagal: Jumlah withdraw tidak valid.");
        return;
    }

    if ((userData.simulated_balance || 0) < amount) {
        alert(`Gagal: Saldo ${username} (${formatRupiah(userData.simulated_balance)}) tidak mencukupi untuk penarikan ${formatRupiah(amount)}.`);
        return;
    }

    userData.simulated_balance = userData.simulated_balance - amount;
    saveUser(username, userData);

    alert(`SUKSES! Saldo ${username} telah dikurangi ${formatRupiah(amount)} untuk penarikan. Saldo baru: ${formatRupiah(userData.simulated_balance)}. Harap lakukan transfer dana nyata.`);
    
    document.getElementById('withdrawFormPanel').reset();
}

// Pasang Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login Admin
    if (document.getElementById('adminLoginForm')) {
        document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    }
    // Dashboard Admin
    if (document.getElementById('adminDashboardBody')) {
        loadDashboardUsers();
    }
    // Deposit Panel
    if (document.getElementById('depositFormPanel')) {
        document.getElementById('depositFormPanel').addEventListener('submit', handleDepositPanel);
    }
    // Withdraw Panel
    if (document.getElementById('withdrawFormPanel')) {
        document.getElementById('withdrawFormPanel').addEventListener('submit', handleWithdrawPanel);
    }
});