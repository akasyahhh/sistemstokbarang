/* ================= LOGIN ================= */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        if (username === "admin" && password === "admins") {
            localStorage.setItem("loggedIn", "true");
            window.location.href = "dashboard.html";
        } else {
            alert("Username atau password salah!");
        }
    });
}

/* ================= LOGOUT ================= */
const logoutBtn = document.getElementById("logout");
if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("loggedIn");
        window.location.href = "index.html";
    });
}

/* ================= CEK LOGIN ================= */
if (
    window.location.pathname.includes("dashboard.html") &&
    !localStorage.getItem("loggedIn")
) {
    window.location.href = "index.html";
}

/* ================= PEMBELIAN ================= */
const purchaseForm = document.getElementById("purchaseForm");
if (purchaseForm) {
    purchaseForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const item = document.getElementById("itemName").value;
        const qty = parseInt(document.getElementById("quantity").value);
        const price = parseFloat(document.getElementById("price").value);

        const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");

        purchases.push({
            item,
            qty,
            price,
            total: qty * price,
            date: new Date().toLocaleString("id-ID")
        });

        localStorage.setItem("purchases", JSON.stringify(purchases));
        displayPurchases();
        purchaseForm.reset();
    });
}

function displayPurchases() {
    const list = document.getElementById("purchaseList");
    if (!list) return;

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");

    list.innerHTML = purchases.map(p => `
        <p>
            <strong>${p.item}</strong><br>
            ${p.qty} x Rp ${p.price.toLocaleString()} = 
            <strong>Rp ${p.total.toLocaleString()}</strong><br>
            <small>${p.date}</small>
        </p>
    `).join("");
}
displayPurchases();

/* ================= PEMBAYARAN ================= */
const paymentForm = document.getElementById("paymentForm");
if (paymentForm) {
    paymentForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const total = parseFloat(document.getElementById("totalAmount").value);
        const method = document.getElementById("paymentMethod").value;

        const payments = JSON.parse(localStorage.getItem("payments") || "[]");

        payments.push({
            total,
            method,
            date: new Date().toLocaleString("id-ID")
        });

        localStorage.setItem("payments", JSON.stringify(payments));

        const status = document.getElementById("paymentStatus");
        if (status) {
            status.innerHTML = `
                <p>
                    Pembayaran <strong>Rp ${total.toLocaleString()}</strong>
                    via <strong>${method}</strong><br>
                    <small>${new Date().toLocaleString("id-ID")}</small>
                </p>
            `;
        }

        paymentForm.reset();
    });
}

/* ================= STOK ================= */
const stockForm = document.getElementById("stockForm");
if (stockForm) {
    stockForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const item = document.getElementById("stockItem").value;
        const qty = document.getElementById("stockQuantity").value;

        const stocks = JSON.parse(localStorage.getItem("stocks") || "{}");
        stocks[item] = qty;

        localStorage.setItem("stocks", JSON.stringify(stocks));
        displayStocks();
        stockForm.reset();
    });
}

function displayStocks() {
    const list = document.getElementById("stockList");
    if (!list) return;

    const stocks = JSON.parse(localStorage.getItem("stocks") || "{}");

    list.innerHTML = Object.entries(stocks)
        .map(([item, qty]) => `<p>${item}: ${qty}</p>`)
        .join("");
}
displayStocks();

/* ================= LAPORAN ================= */
function displayReport() {
    const list = document.getElementById("reportList");
    if (!list) return;

    const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
    const payments = JSON.parse(localStorage.getItem("payments") || "[]");

    if (purchases.length === 0 && payments.length === 0) {
        list.innerHTML = `<p style="text-align:center;color:#888;">Belum ada data</p>`;
        return;
    }

    const totalSales = purchases.reduce((sum, p) => sum + p.total, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.total, 0);

    let html = `
        <h3>Ringkasan</h3>
        <p><strong>Total Penjualan:</strong> Rp ${totalSales.toLocaleString()}</p>
        <p><strong>Total Pembayaran:</strong> Rp ${totalPayments.toLocaleString()}</p>
    `;

    if (purchases.length > 0) {
        html += `<h3>Data Pembelian</h3>`;
        html += purchases.map(p => `
            <p>
                <strong>${p.item}</strong><br>
                Total: Rp ${p.total.toLocaleString()}<br>
                <small>${p.date}</small>
            </p>
        `).join("");
    }

    if (payments.length > 0) {
        html += `<h3>Data Pembayaran</h3>`;
        html += payments.map(p => `
            <p>
                Rp ${p.total.toLocaleString()} - ${p.method}<br>
                <small>${p.date}</small>
            </p>
        `).join("");
    }

    list.innerHTML = html;
}
displayReport();

/* ================= HAPUS DATA PEMBELIAN ================= */
const clearBtn = document.getElementById("clearPurchase");
if (clearBtn) {
    clearBtn.addEventListener("click", function () {
        if (confirm("Yakin ingin mengosongkan data pembelian?")) {
            localStorage.removeItem("purchases");
            displayPurchases();
            alert("Data pembelian berhasil dikosongkan.");
        }
    });
}

/* ================= EKSPOR EXCEL ================= */
const exportBtn = document.getElementById("exportReport");
if (exportBtn) {
    exportBtn.addEventListener("click", function () {
        const purchases = JSON.parse(localStorage.getItem("purchases") || "[]");
        const payments = JSON.parse(localStorage.getItem("payments") || "[]");

        if (purchases.length === 0 && payments.length === 0) {
            alert("Tidak ada data untuk diekspor.");
            return;
        }

        let csv = "LAPORAN PENJUALAN\n\n";
        csv += "PEMBELIAN\nNama,Jumlah,Harga,Total,Tanggal\n";

        purchases.forEach(p => {
            csv += `${p.item},${p.qty},${p.price},${p.total},${p.date}\n`;
        });

        csv += "\nPEMBAYARAN\nTotal,Metode,Tanggal\n";
        payments.forEach(p => {
            csv += `${p.total},${p.method},${p.date}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "laporan_penjualan.csv";
        link.click();
    });
}

/* ================= JAM DASHBOARD ================= */
function updateDateTime() {
    const el = document.getElementById("currentDate");
    if (!el) return;

    el.textContent = new Date().toLocaleString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });
}
updateDateTime();
setInterval(updateDateTime, 1000);
