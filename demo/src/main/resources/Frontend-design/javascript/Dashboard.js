/* =========================================================
   DASHBOARD.JS - ĐÃ SỬA LỖI NỀN CANVAS
   ========================================================= */

let idnhanviendangnhap = localStorage.getItem("POS_STAFF_ID");
let tennhanviendangnhap = localStorage.getItem("POS_STAFF_NAME") || "Nhân Viên";
let dashboardLoading = false;
let lastDashboardData = null;

const API_BASE = "http://localhost:8080/api/dashboard";

document.addEventListener("DOMContentLoaded", function () {
    if (!idnhanviendangnhap) {
        alert("Vui lòng đăng nhập trước khi sử dụng hệ thống!");
        if (window.javaBackend) {
            window.javaBackend.loadTrang("Login.html");
        } else {
            window.location.href = "Login.html";
        }
        return;
    }

    const staffId = document.getElementById("staffid");
    const staffName = document.getElementById("staffname");

    if (staffId) staffId.innerText = idnhanviendangnhap;
    if (staffName) staffName.innerText = tennhanviendangnhap;

    updateClocks();
    setInterval(updateClocks, 1000);
    getRealTimeWeather();

    setTimeout(function () {
        fetchDashboardData();
    }, 200);

    setInterval(function () {
        fetchDashboardData();
    }, 10000);
});

function scaleApp() {
    const wrapper = document.getElementById("app-wrapper");
    if (!wrapper) return;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scale = Math.min(viewportWidth / 1440, viewportHeight / 1080);
    wrapper.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", function () {
    scaleApp();
    if (lastDashboardData) {
        setTimeout(redrawDashboardCharts, 50);
    }
});

scaleApp();

function chuyentrang(trang) {
    if (window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        window.location.href = trang;
    }
}

function updateClocks() {
    const now = new Date();
    const vnDays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dateString = `${vnDays[now.getDay()]}, ${now.getDate()} tháng ${now.getMonth() + 1}, ${now.getFullYear()}`;
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const fullTime = `${hours}:${minutes}:${seconds}`;

    const currentDateEl = document.getElementById("current-date");
    const currentTimeEl = document.getElementById("current-time");

    if (currentDateEl) currentDateEl.innerText = dateString;
    if (currentTimeEl) currentTimeEl.innerText = fullTime;

    const enDays = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const enMonths = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    
    const widgetDateEl = document.getElementById("widget-date");
    if (widgetDateEl) {
        widgetDateEl.innerText = `${enDays[now.getDay()]}, ${enMonths[now.getMonth()]} ${now.getDate()}`;
    }

    let widgetHours = now.getHours();
    const widgetMinutes = String(now.getMinutes()).padStart(2, "0");
    const ampm = widgetHours >= 12 ? "PM" : "AM";
    widgetHours = widgetHours % 12;
    if (widgetHours === 0) widgetHours = 12;

    const widgetTimeEl = document.getElementById("widget-time");
    const widgetAmpmEl = document.getElementById("widget-ampm");

    if (widgetTimeEl) widgetTimeEl.innerText = `${widgetHours}:${widgetMinutes}`;
    if (widgetAmpmEl) widgetAmpmEl.innerText = ampm;
}

async function getRealTimeWeather() {
    const tempEl = document.getElementById("weather-temp");
    try {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=10.823&longitude=106.6296&current_weather=true";
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather HTTP " + response.status);
        const data = await response.json();
        if (tempEl && data.current_weather) {
            const temperature = Number(data.current_weather.temperature);
            tempEl.innerText = Math.round(temperature) + "°C";
        }
    } catch (error) {
        if (tempEl) tempEl.innerText = "29°C";
    }
}

async function fetchDashboardData() {
    if (dashboardLoading) return;
    dashboardLoading = true;
    try {
        const response = await fetch(API_BASE, { method: "GET", cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        
        const data = await response.json();
        lastDashboardData = data;

        const currentRevenue = toNumber(data.doanhThuTuanNay);
        const previousRevenue = toNumber(data.doanhThuTuanTruoc);
        let growth = toNumber(data.tangTruongDoanhThu);

        const labels = normalizeLabels(data.labels);
        const quantities = normalizeSevenValues(data.bieuDoSoLuongTheoTuan);
        const revenues = normalizeSevenValues(data.bieuDoDoanhThuTheoTuan);
        const topProducts = normalizeTopProducts(data.topSanPhamBanChay);

        const revAmountEl = document.querySelector(".rev-amount");
        if (revAmountEl) {
            revAmountEl.textContent = formatCurrency(currentRevenue);
        }
        const previousRevenueEl = document.getElementById("previous-revenue");
        if (previousRevenueEl) {
            previousRevenueEl.textContent = formatCurrency(previousRevenue) + " đ";
        }

        const growthEl = document.getElementById("growth-value");
        if (growthEl) {
            growthEl.innerText = (growth >= 0 ? "+" : "") + growth.toFixed(1);
        }

        drawRevenueDoughnut(currentRevenue, previousRevenue);
        drawWeeklyChart(labels, quantities, revenues);
        renderTopProductsDOM(topProducts);
        updateTopCategoryWidget(data.topLoaiSanPham, data.tyTrongLoaiSanPham);

    } catch (error) {
        console.error("Lỗi khi kết nối API Dashboard Spring Boot:", error);
    } finally {
        dashboardLoading = false;
    }
}

function redrawDashboardCharts() {
    if (!lastDashboardData) return;
    const data = lastDashboardData;
    const labels = normalizeLabels(data.labels);
    const quantities = normalizeSevenValues(data.bieuDoSoLuongTheoTuan);
    const revenues = normalizeSevenValues(data.bieuDoDoanhThuTheoTuan);
    const topProducts = normalizeTopProducts(data.topSanPhamBanChay);

    drawRevenueDoughnut(toNumber(data.doanhThuTuanNay), toNumber(data.doanhThuTuanTruoc));
    drawWeeklyChart(labels, quantities, revenues);
    renderTopProductsDOM(topProducts);
    updateTopCategoryWidget(data.topLoaiSanPham, data.tyTrongLoaiSanPham);
}

function prepareCanvas(canvas) {
    if (!canvas) return null;
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    if (width <= 0 && canvas.parentElement) width = canvas.parentElement.clientWidth;
    if (height <= 0 && canvas.parentElement) height = canvas.parentElement.clientHeight;
    width = Math.max(Math.floor(width), 50);
    height = Math.max(Math.floor(height), 50);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, width: width, height: height };
}

function drawRevenueDoughnut(currentRevenue, previousRevenue) {
    const canvas = document.getElementById("revenueDoughnut");
    const prepared = prepareCanvas(canvas);
    if (!prepared) return;
    const ctx = prepared.ctx;
    const width = prepared.width;
    const height = prepared.height;

    // Tô nền trắng cho biểu đồ doanh thu
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const current = Math.max(toNumber(currentRevenue), 0);
    const previous = Math.max(toNumber(previousRevenue), 0);
    const total = current + previous || 1;
    const ratioCurrent = current / total;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const lineWidth = 12;
    const radius = Math.max(1, Math.min(width, height) / 2 - lineWidth / 2 - 2);

    let startAngle = -Math.PI / 2;
    const currentAngle = ratioCurrent * Math.PI * 2;
    drawDonutArc(ctx, centerX, centerY, radius, lineWidth, startAngle, startAngle + currentAngle, "#b85d19");
    drawDonutArc(ctx, centerX, centerY, radius, lineWidth, startAngle + currentAngle, startAngle + Math.PI * 2, "#E0E0E0");
    
    ctx.font = "bold 11px Segoe UI";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(ratioCurrent * 100) + "%", centerX, centerY);
}

function drawDonutArc(ctx, centerX, centerY, radius, lineWidth, startAngle, endAngle, color) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawWeeklyChart(labels, quantities, revenues) {
    const canvas = document.getElementById("weeklySalesChart");
    const prepared = prepareCanvas(canvas);
    if (!prepared) return;
    const ctx = prepared.ctx;
    const width = prepared.width;
    const height = prepared.height;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    const safeLabels = normalizeLabels(labels);
    const safeQuantities = normalizeSevenValues(quantities);

    const left = 45;
    const right = 35;
    const top = 25;
    const bottom = 35;
    const chartWidth = Math.max(width - left - right, 100);
    const chartHeight = Math.max(height - top - bottom, 100);

    const maxVal = Math.max(...safeQuantities, 100);
    const maxQuantity = Math.ceil(maxVal / 20) * 20 || 100;

    const gridCount = 4;
    for (let i = 0; i <= gridCount; i++) {
        const ratio = i / gridCount;
        const y = top + chartHeight - ratio * chartHeight;

        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.05)";
        ctx.stroke();

        const quantityValue = Math.round(ratio * maxQuantity);
        ctx.font = "11px Segoe UI";
        ctx.fillStyle = "#9ca3af";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(quantityValue, left - 10, y);
    }

    const dayCount = 7;
    const step = chartWidth / dayCount;
    const barWidth = Math.min(28, step * 0.45);

    for (let i = 0; i < dayCount; i++) {
        const quantity = safeQuantities[i];
        const barHeight = (quantity / maxQuantity) * chartHeight;
        const centerX = left + step * i + step / 2;
        const x = centerX - barWidth / 2;
        const y = top + chartHeight - barHeight;

        ctx.fillStyle = "#b85d19";
        const r = 6;
        ctx.beginPath();
        ctx.moveTo(x, y + barHeight);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.lineTo(x + barWidth - r, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.closePath();
        ctx.fill();

        if (quantity > 0) {
            ctx.fillStyle = "#111";
            ctx.font = "bold 11px Segoe UI";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(quantity.toString(), centerX, y - 6);
        }
    }

    ctx.beginPath();
    for (let i = 0; i < dayCount; i++) {
        const quantity = safeQuantities[i];
        const centerX = left + step * i + step / 2;
        const y = top + chartHeight - (quantity / maxQuantity) * chartHeight;
        if (i === 0) ctx.moveTo(centerX, y);
        else ctx.lineTo(centerX, y);
    }
    ctx.strokeStyle = "#b85d19";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.stroke();

    for (let i = 0; i < dayCount; i++) {
        const quantity = safeQuantities[i];
        const centerX = left + step * i + step / 2;
        const y = top + chartHeight - (quantity / maxQuantity) * chartHeight;

        ctx.beginPath();
        ctx.arc(centerX, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#b85d19";
        ctx.stroke();
    }

    ctx.fillStyle = "#4b5563";
    ctx.font = "bold 11px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    for (let i = 0; i < dayCount; i++) {
        const centerX = left + step * i + step / 2;
        ctx.fillText(safeLabels[i], centerX, top + chartHeight + 10);
    }
}

function renderTopProductsDOM(products) {
    const listContainer = document.getElementById("top-product-list");
    if (!listContainer) return;

    if (!products || products.length === 0) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #888; font-size: 13px;">Chưa có dữ liệu bán hàng</div>`;
        return;
    }

    listContainer.innerHTML = products.map((item, index) => {
        const name = item.tenSanPham || "Sản phẩm";
        const qty = item.soLuong || 0;
        const icon = getProductIcon(name);
        const estimatedRevenue = formatCurrency(qty * 25000);

        return `
            <div class="product-card-item">
                <div class="product-card-left">
                    <div class="product-icon">${icon}</div>
                    <div class="product-card-info">
                        <div class="product-card-title">${name}</div>
                        <div class="product-card-sub">${qty} ly bán ra</div>
                    </div>
                </div>
                <div class="product-card-right">
                    <div class="product-val">${estimatedRevenue}</div>
                    <div class="product-growth">+${(15 - index * 3)}%</div>
                </div>
            </div>
        `;
    }).join("");
}

function getProductIcon(name) {
    const normalizedName = name.toLowerCase();
    let drawing = '<path d="M6 8h12l-1.2 9H7.2L6 8Z"/><path d="M8 5h8M9 20h6"/>';

    if (/matcha|tra|trà/.test(normalizedName)) {
        drawing = '<path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9Z"/><path d="M17 11h1a3 3 0 0 1 0 6h-2M8 5c-1-1 1-2 0-3"/><path d="M9 14c1-3 3-4 6-4-1 3-3 4-6 4Z"/>';
    } else if (/sua|sữa|latte|bac xiu|bạc xỉu/.test(normalizedName)) {
        drawing = '<path d="M8 4h8l1 3-1 13H8L7 7l1-3Z"/><path d="M7 8h10M10 4V2h4v2"/>';
    } else if (/nuoc|nước|sinh to|sinh tố|juice/.test(normalizedName)) {
        drawing = '<path d="M7 7h10l-1 13H8L7 7Z"/><path d="M6 4h12M12 7V3M12 3l4-2"/><circle cx="12" cy="12" r="2"/>';
    } else if (/ca phe|cà phê|coffee|espresso/.test(normalizedName)) {
        drawing = '<path d="M5 9h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"/><path d="M17 11h1a3 3 0 0 1 0 6h-2M8 5c-1-1 1-2 0-3M12 5c-1-1 1-2 0-3"/>';
    }

    return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#b45309" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;
}

function updateTopCategoryWidget(category, share) {
    const categoryName = typeof category === "string" ? category.trim() : "";
    const percentage = Math.min(Math.max(toNumber(share), 0), 100);
    const title = document.querySelector(".share-title");
    const subtitle = document.querySelector(".share-sub");

    if (title) {
        title.textContent = categoryName
            ? `${categoryName} chiếm ${formatSharePercentage(percentage)}%`
            : "Chưa có dữ liệu bán hàng";
    }
    if (subtitle) {
        subtitle.textContent = categoryName
            ? "Tỷ trọng doanh thu lớn nhất trong 7 ngày qua"
            : "Chưa có doanh thu sản phẩm trong 7 ngày qua";
    }

    drawTopProductsDoughnut(percentage, Boolean(categoryName));
}

function formatSharePercentage(percentage) {
    return Number.isInteger(percentage) ? String(percentage) : percentage.toFixed(1);
}

function drawTopProductsDoughnut(percentage, hasSales) {
    const canvas = document.getElementById("topProductsDoughnut");
    const prepared = prepareCanvas(canvas);
    if (!prepared) return;
    const ctx = prepared.ctx;
    const width = prepared.width;
    const height = prepared.height;

    // Tô màu nền khớp hoàn toàn với khung chứa (#fafafa) để loại bỏ nền đen
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 4;
    const lineWidth = 8;

    const share = hasSales ? percentage / 100 : 0;
    const startAngle = -Math.PI / 2;
    const shareAngle = Math.PI * 2 * share;
    if (share > 0) {
        drawDonutArc(ctx, centerX, centerY, radius, lineWidth, startAngle, startAngle + shareAngle, "#b85d19");
    }
    if (share < 1) {
        drawDonutArc(ctx, centerX, centerY, radius, lineWidth, startAngle + shareAngle, startAngle + Math.PI * 2, "#E0E0E0");
    }

    ctx.font = "bold 9px Segoe UI";
    ctx.fillStyle = "#111";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${formatSharePercentage(hasSales ? percentage : 0)}%`, centerX, centerY);
}

function normalizeLabels(labels) {
    if (!Array.isArray(labels) || labels.length === 0) return ["06/10", "07/10", "08/10", "09/10", "10/10", "11/10", "12/10"];
    const result = labels.slice(0, 7).map(label => String(label));
    while (result.length < 7) result.push("");
    return result;
}

function normalizeSevenValues(values) {
    let result = Array.isArray(values) ? values.slice(0, 7).map(val => toNumber(val)) : [];
    while (result.length < 7) result.push(0);
    return result;
}

function normalizeTopProducts(products) {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 5).map(product => ({
        sanPhamId: product.sanPhamId ?? null,
        tenSanPham: product.tenSanPham || "Sản phẩm",
        soLuong: toNumber(product.soLuongBan ?? product.soLuong ?? 0)
    }));
}

function toNumber(value) {
    if (value === null || value === undefined || value === "") return 0;
    const result = Number(value);
    return Number.isFinite(result) ? result : 0;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}