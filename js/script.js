// script.js
// Logika Sisi Klien untuk User (Register, Login, Deposit, Withdraw, Auth)
// Menggunakan localStorage untuk simulasi penyimpanan data.

// --- 1. UTILITIES & DATA MANAGEMENT ---

const ADMIN_USER = "admin";
const ADMIN_PASS = "123456"; 

/**
 * Mengambil data pengguna berdasarkan username.
 */
function getUser(username) {
    const usersData = localStorage.getItem('users');
    if (usersData) {
        try {
            const users = JSON.parse(usersData);
            const user = users.find(u => u.username === username);
            return user || null;
        } catch (e) {
            console.error("Gagal parsing data pengguna:", e);
            return null;
        }
    }
    return null;
}

/**
 * Menyimpan data pengguna tertentu ke localStorage.
 */
function saveUser(username, userData) {
    localStorage.setItem(username, JSON.stringify(userData));
}

/**
 * Memformat angka menjadi format mata uang Rupiah.
 */
function formatRupiah(number) {
    return 'IDR ' + new Intl.NumberFormat('id-ID').format(number || 0);
}

// --- 2. AUTHENTICATION (REGISTER & LOGIN) ---

/**
 * Menangani proses registrasi akun baru.
 */
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (getUser(username)) {
        alert("Pendaftaran Gagal: Nama Pengguna sudah digunakan!");
        return;
    }

    if (username.length < 6 || password.length < 8) {
        alert("Gagal: Username minimal 6 karakter dan Password minimal 8 karakter.");
        return;
    }

    const newUser = {
        password: password,
        email: email,
        phone: phone,
        simulated_balance: 1000000, // Saldo awal simulasi IDR 1,000,000
        registration_date: new Date().toLocaleString()
    };

    saveUser(username, newUser);
    alert("Pendaftaran Berhasil! Silakan Login.");
    window.location.href = "index.html";
}

/**
 * Logika inti untuk memproses login. Dipakai oleh login.html dan login cepat.
 */
function processLogin(username, password) {
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        alert("Gagal: Silakan Login melalui Panel Admin.");
        return false;
    }

    const user = getUser(username);

    if (user && user.password === password) {
        localStorage.setItem('activeUser', username);
        alert(`Login Berhasil! Selamat datang, ${username}.`);
        // Redirect user to dashboard page instead of index
        window.location.href = "dashboard.html";
        return true;
    } else if (!user) {
        alert("Login Gagal: Nama Pengguna tidak ditemukan. Silakan daftar terlebih dahulu.");
        return false;
    } else {
        alert("Login Gagal: Kata Sandi salah.");
        return false;
    }
}

/**
 * Menangani proses login pengguna dari halaman login.html.
 */
function handleLogin(e) {
    e.preventDefault();
    // login.html already removed, so no action needed here
}

/**
 * Menangani proses login cepat dari index.html.
 */
function handleFastLogin(username, password) {
    // Repeatedly prompt user until login success
    let loggedIn = false;
    while (!loggedIn) {
        if (!username || !password) {
            alert("Nama Pengguna dan Kata Sandi harus diisi.");
            return;
        }
        loggedIn = processLogin(username, password);
        if (!loggedIn) {
            username = prompt("Masukkan nama pengguna yang valid:");
            if (username === null) {
                // User cancelled
                return;
            }
            password = prompt("Masukkan kata sandi yang benar:");
            if (password === null) {
                // User cancelled
                return;
            }
        }
    }
}
window.handleFastLoginJS = handleFastLogin;

/**
 * Memastikan pengguna sudah login sebelum mengakses dashboard/profil.
 */
function checkAuth() {
    const activeUser = localStorage.getItem('activeUser');
    if (!activeUser) {
        // Hanya alihkan jika bukan halaman index (index tidak memerlukan auth)
        if (document.body.id === 'dashboardBody' || document.body.id === 'profileBody') {
             alert("Anda harus Login terlebih dahulu.");
             window.location.href = "index.html";
        }
        return null;
    }
    return activeUser;
}

/**
 * Memuat data saldo dan username ke Header pada halaman yang diautentikasi.
 */
function loadDashboard() {
    const username = checkAuth();
    if (username) {
        const userData = getUser(username);
        if (userData) {
            // Memperbarui informasi di header (di semua halaman ber-auth)
            if (document.getElementById('currentUsername')) {
                document.getElementById('currentUsername').textContent = username;
            }
            if (document.getElementById('totalSaldo')) {
                document.getElementById('totalSaldo').textContent = formatRupiah(userData.simulated_balance || 0);
            }
        }
    }
}

/**
 * Menangani proses logout pengguna.
 */
function logout() {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
        localStorage.removeItem('activeUser');
        alert("Anda telah Logout.");
        window.location.href = "index.html";
    }
}

// --- 3. TRANSAKSI (DEPOSIT & WITHDRAW) ---

/**
 * Membuka modal Withdraw.
 */
function openWithdrawModal() {
    if (checkAuth()) { 
        document.getElementById('withdrawModal').style.display = 'flex';
    }
}

/**
 * Menutup modal Withdraw.
 */
function closeWithdrawModal() {
    document.getElementById('withdrawModal').style.display = 'none';
    const withdrawAmountInput = document.getElementById('withdrawAmount');
    if (withdrawAmountInput) withdrawAmountInput.value = '';
}

/**
 * Menangani simulasi pengiriman formulir Deposit (Inline di Dashboard).
 */
function handleDepositInline(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('depositAmountInline').value);

    if (isNaN(amount) || amount < 10000) {
        alert("Simulasi Gagal: Minimal deposit adalah IDR 10.000.");
        return;
    }

    alert(`SIMULASI DEPOSIT BERHASIL! Permintaan deposit ${formatRupiah(amount)} telah dikirim. Saldo Anda akan diupdate setelah diproses Admin.`);
}


// --- 4. EVENT LISTENERS (Menghubungkan JS ke HTML) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Register Form (register.html)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // 2. Login Form (login.html) already removed
    // So do not register event listener for loginForm
    /*
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    */

    // 3. Deposit Form Inline (dashboard.html)
    const depositFormInline = document.getElementById('depositFormInline');
    if (depositFormInline) {
        depositFormInline.addEventListener('submit', handleDepositInline);
    }

    // 4. Withdraw Form Inline (dashboard.html)
    const withdrawFormInline = document.getElementById('withdrawFormInline');
    if (withdrawFormInline) {
        withdrawFormInline.addEventListener('submit', handleWithdraw);
    }

    // 5. Logout Button (dashboard.html)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // 6. Deposit and Withdraw button toggles (dashboard.html)
    const openDepositBtn = document.getElementById('openDepositBtn');
    const openWithdrawBtn = document.getElementById('openWithdrawBtn');
    const depositSection = document.querySelector('.deposit-form-simulasi');
    const withdrawSection = document.querySelector('.withdraw-form-simulasi');

if (openDepositBtn && openWithdrawBtn && depositSection && withdrawSection) {
    // Initially show deposit, hide withdraw
    depositSection.style.display = 'flex';
    withdrawSection.style.display = 'none';

    openDepositBtn.addEventListener('click', () => {
        depositSection.style.display = 'flex';
        withdrawSection.style.display = 'none';
        depositSection.scrollIntoView({behavior: 'smooth'});
        // Optionally mark buttons active/inactive (for better UX)
        openDepositBtn.classList.add('active');
        openWithdrawBtn.classList.remove('active');
    });

    openWithdrawBtn.addEventListener('click', () => {
        depositSection.style.display = 'none';
        withdrawSection.style.display = 'flex';
        withdrawSection.scrollIntoView({behavior: 'smooth'});
        // Optionally mark buttons active/inactive
        openWithdrawBtn.classList.add('active');
        openDepositBtn.classList.remove('active');
    });

    // Set initial active button style
    openDepositBtn.classList.add('active');
    openWithdrawBtn.classList.remove('active');
}
});

// Tambahkan listener untuk menutup modal saat klik di luar area modal
window.onclick = function(event) {
    const withModal = document.getElementById('withdrawModal');
    if (event.target == withModal) {
        closeWithdrawModal();
    }
}

// --- BAGIAN PERUBAHAN PASSWORD PROFIL ---

document.addEventListener('DOMContentLoaded', () => {
    const profileSubmitBtn = document.querySelector('.btn-submit');
    if (profileSubmitBtn) {
        profileSubmitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const activeUser = localStorage.getItem('activeUser');
            if (!activeUser) {
                alert('Anda harus login untuk mengubah profil.');
                window.location.href = 'login.html';
                return;
            }
            const oldPasswordInput = document.querySelector('input[placeholder="Kata Sandi Lama"]');
            const newPasswordInput = document.querySelector('input[placeholder="Kata Sandi Baru"]');
            const confirmPasswordInput = document.querySelector('input[placeholder="Konfirmasi Kata Sandi"]');

            if (!oldPasswordInput || !newPasswordInput || !confirmPasswordInput) {
                alert('Form tidak lengkap.');
                return;
            }

            const oldPassword = oldPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            const userData = getUser(activeUser);

            if (!userData) {
                alert('Data pengguna tidak ditemukan.');
                return;
            }

            if (userData.password !== oldPassword) {
                alert('Kata sandi lama salah.');
                return;
            }

            if (newPassword.length < 8) {
                alert('Kata sandi baru harus minimal 8 karakter.');
                return;
            }

            if (newPassword !== confirmPassword) {
                alert('Konfirmasi kata sandi tidak cocok.');
                return;
            }

            userData.password = newPassword;
            saveUser(activeUser, userData);
            alert('Kata sandi berhasil diubah.');
            oldPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
        });
    }
});
