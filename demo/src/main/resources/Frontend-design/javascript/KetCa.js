// =====================================================
// 1. KIỂM TRA ĐĂNG NHẬP, PHÂN QUYỀN & ĐỒNG HỒ TOPBAR
// (Đồng bộ 100% logic hệ thống từ QuanLySanPham.js)
// =====================================================
let idnhanviendangnhap = localStorage.getItem('POS_STAFF_ID');
let tennhanviendangnhap = localStorage.getItem('POS_STAFF_NAME') || 'Nhân Viên';
let vaitrodangnhap = (localStorage.getItem('POS_STAFF_ROLE') || 'ADMIN').trim().toUpperCase();

// Phân quyền: ADMIN có toàn quyền quản lý
let isManagerMode = (vaitrodangnhap === 'ADMIN');

document.addEventListener("DOMContentLoaded", function() {
    if (!idnhanviendangnhap) {
        alert("Vui lòng đăng nhập trước khi sử dụng hệ thống!");
        if (window.javaBackend) {
            window.javaBackend.loadTrang('Login.html');
        } else {
            window.location.href = "Login.html"; 
        }
        return;
    }

    const staffIdEl = document.getElementById('staffid');
    const staffNameEl = document.getElementById('staffname');
    if (staffIdEl) staffIdEl.innerText = idnhanviendangnhap; 
    if (staffNameEl) staffNameEl.innerText = tennhanviendangnhap;

    // Khởi tạo dữ liệu và giao diện Kết Ca
    initKetCaPage();

    // Lắng nghe phím tắt toàn cục (ESC, F10, phím số nhập liệu)
    document.addEventListener('keydown', handleGlobalKeyDown);
});

function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    if (!wrapper) return;
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 1080);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

function updateCurrentTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN');
    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');
    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

function chuyentrang(trang) {
    if (window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        window.location.href = trang;
    }
}

// =====================================================
// 2. BIẾN TOÀN CỤC & DỮ LIỆU KIỂM KÊ / ĐỐI SOÁT QUỸ CA
// =====================================================
const KETCA_API_URL = 'http://localhost:8080/api/ketca';
const STORAGE_DENOM_KEY = 'POS_KETCA_DENOM_STATE';
const STORAGE_HISTORY_KEY = 'POS_KETCA_HISTORY';

// Danh sách 10 mệnh giá tiêu chuẩn (mặc định 10 tờ 500.000đ = 5.000.000đ như hình mẫu)
const DEFAULT_DENOMINATIONS = [
    { value: 500000, qty: 10 },
    { value: 200000, qty: 0 },
    { value: 100000, qty: 0 },
    { value: 50000,  qty: 0 },
    { value: 20000,  qty: 0 },
    { value: 10000,  qty: 0 },
    { value: 5000,   qty: 0 },
    { value: 2000,   qty: 0 },
    { value: 1000,   qty: 0 },
    { value: 500,    qty: 0 }
];

let denominationsState = [];
let activeDenomIndex = 0;
let isFreshSelection = true; // Khi vừa chọn dòng mới, bấm số sẽ nhập mới thay vì nối đuôi số cũ

// Thông tin quỹ ca hiện tại (đồng bộ theo thông số mẫu)
let shiftSummaryData = {
    expectedCashInDrawer: 5000000, // Tổng tiền mặt hệ thống ghi nhận (gồm cả quỹ nổi)
    cardAndQrRevenue: 3650000,     // Doanh thu thẻ / QR
    initialFloatFund: 1000000      // Quỹ nổi ban đầu trừ lại két
};

// Dữ liệu lịch sử nộp tiền các đợt mặc định
const DEFAULT_HANDOVER_HISTORY = [
    {
        id: 1,
        date: '01/01/2026',
        time: '23:59',
        status: 'Đã duyệt',
        staffName: 'NGUYỄN VĂN A',
        totalSubmit: 500000,
        cashVnd: 300000,
        bankTransfer: 200000
    },
    {
        id: 2,
        date: '01/01/2026',
        time: '23:59',
        status: 'Đã duyệt',
        staffName: 'TRỊNH TRẦN PHƯƠNG TUẤN',
        totalSubmit: 5000000,
        cashVnd: 0,
        bankTransfer: 5000000
    }
];

function formatNumberVN(amount) {
    return Number(amount || 0).toLocaleString('vi-VN');
}

function formatCurrencyDong(amount) {
    return `${formatNumberVN(amount)} đ`;
}

function formatCurrencyVND(amount) {
    return `${formatNumberVN(amount)} VNĐ`;
}

// =====================================================
// 3. KHỞI TẠO & LƯU TRỮ TRẠNG THÁI LOCALSTORAGE
// =====================================================
function loadDenominationsFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_DENOM_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length === DEFAULT_DENOMINATIONS.length) {
                denominationsState = parsed.map((item, idx) => ({
                    value: DEFAULT_DENOMINATIONS[idx].value,
                    qty: Math.max(0, parseInt(item.qty || 0, 10))
                }));
                return;
            }
        }
    } catch (e) {
        console.error("Lỗi đọc trạng thái mệnh giá:", e);
    }
    denominationsState = DEFAULT_DENOMINATIONS.map(item => ({ ...item }));
}

function saveDenominationsToStorage() {
    try {
        localStorage.setItem(STORAGE_DENOM_KEY, JSON.stringify(denominationsState));
    } catch (e) {}
}

function getHandoverHistoryFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {}
    return DEFAULT_HANDOVER_HISTORY.map(item => ({ ...item }));
}

function saveHandoverHistoryToStorage(list) {
    try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(list));
    } catch (e) {}
}

async function initKetCaPage() {
    loadDenominationsFromStorage();
    activeDenomIndex = 0;
    isFreshSelection = true;

    // Nếu có API backend thật, tự động đồng bộ thông số quỹ ca
    await fetchShiftSummaryFromApi();

    renderDenominationTable();
    updateKeypadScreen();
    updateReconciliationSummary();
    renderHandoverHistory();
}

async function fetchShiftSummaryFromApi() {
    try {
        const response = await fetch(`${KETCA_API_URL}/current-shift`);
        if (response.ok) {
            const data = await response.json();
            if (data) {
                if (data.expectedCashInDrawer !== undefined) shiftSummaryData.expectedCashInDrawer = Number(data.expectedCashInDrawer);
                if (data.cardAndQrRevenue !== undefined) shiftSummaryData.cardAndQrRevenue = Number(data.cardAndQrRevenue);
                if (data.initialFloatFund !== undefined) shiftSummaryData.initialFloatFund = Number(data.initialFloatFund);
            }
        }
    } catch (e) {
        // Sử dụng dữ liệu mặc định khi chạy độc lập hoặc chưa bật API ketca
    }
}

// =====================================================
// 4. BẢNG KIỂM KÊ MỆNH GIÁ & BÀN PHÍM CẢM ỨNG
// =====================================================
function renderDenominationTable() {
    const container = document.getElementById('denom-list-container');
    if (!container) return;

    container.innerHTML = '';

    denominationsState.forEach((item, index) => {
        const isActive = (index === activeDenomIndex);
        const hasValue = (item.qty > 0);
        const lineTotal = item.value * item.qty;

        const rowEl = document.createElement('div');
        rowEl.className = `denom-row ${isActive ? 'active' : ''} ${hasValue ? 'has-value' : ''}`;
        rowEl.onclick = function() {
            selectDenominationRow(index);
        };

        rowEl.innerHTML = `
            <span class="denom-label">${formatCurrencyDong(item.value)}</span>
            <div class="denom-qty-wrapper">
                <input type="text" class="denom-qty-input" value="${item.qty}" readonly tabindex="-1">
            </div>
            <span class="denom-total">${formatCurrencyDong(lineTotal)}</span>
        `;

        container.appendChild(rowEl);
    });
}

function selectDenominationRow(index) {
    if (index < 0 || index >= denominationsState.length) return;
    activeDenomIndex = index;
    isFreshSelection = true;

    renderDenominationTable();
    updateKeypadScreen();
}

function updateKeypadScreen() {
    const current = denominationsState[activeDenomIndex];
    if (!current) return;

    const formattedDenom = formatNumberVN(current.value);
    const subtotal = current.value * current.qty;

    const badgeEl = document.getElementById('keypad-badge-denom');
    const screenDenomEl = document.getElementById('screen-denom-text');
    const screenQtyEl = document.getElementById('screen-qty-number');
    const screenSubtotalEl = document.getElementById('screen-subtotal-text');

    if (badgeEl) badgeEl.innerHTML = `${formattedDenom}<br>đ`;
    if (screenDenomEl) screenDenomEl.innerHTML = `${formattedDenom}<br>đ`;
    if (screenQtyEl) screenQtyEl.innerText = current.qty;
    if (screenSubtotalEl) screenSubtotalEl.innerText = `= ${formatCurrencyDong(subtotal)}`;
}

function pressNumKey(digitStr) {
    const current = denominationsState[activeDenomIndex];
    if (!current) return;

    let currentQtyStr = isFreshSelection ? '' : String(current.qty);
    isFreshSelection = false;

    if (currentQtyStr === '0') {
        currentQtyStr = '';
    }

    const combinedStr = currentQtyStr + String(digitStr);
    const parsedQty = parseInt(combinedStr || '0', 10);

    // Giới hạn tối đa 99.999 tờ để tránh tràn khung hiển thị
    current.qty = isNaN(parsedQty) ? 0 : Math.min(parsedQty, 99999);

    syncAllUI();
}

function pressAddFive() {
    const current = denominationsState[activeDenomIndex];
    if (!current) return;

    isFreshSelection = false;
    current.qty = Math.min((current.qty || 0) + 5, 99999);

    syncAllUI();
}

function pressBackspace() {
    const current = denominationsState[activeDenomIndex];
    if (!current) return;

    isFreshSelection = false;
    const str = String(current.qty || 0);
    current.qty = str.length <= 1 ? 0 : parseInt(str.slice(0, -1), 10);

    syncAllUI();
}

function pressClear() {
    const current = denominationsState[activeDenomIndex];
    if (!current) return;

    isFreshSelection = false;
    current.qty = 0;

    syncAllUI();
}

function moveToNextDenom() {
    const nextIdx = (activeDenomIndex + 1) % denominationsState.length;
    selectDenominationRow(nextIdx);

    const container = document.getElementById('denom-list-container');
    if (container && container.children[nextIdx]) {
        container.children[nextIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function moveToPrevDenom() {
    const prevIdx = (activeDenomIndex - 1 + denominationsState.length) % denominationsState.length;
    selectDenominationRow(prevIdx);

    const container = document.getElementById('denom-list-container');
    if (container && container.children[prevIdx]) {
        container.children[prevIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
}

function resetDenominations() {
    denominationsState.forEach(item => {
        item.qty = 0;
    });
    activeDenomIndex = 0;
    isFreshSelection = true;

    syncAllUI();
}

function calculateTotalCountedCash() {
    return denominationsState.reduce((total, item) => total + (item.value * item.qty), 0);
}

function syncAllUI() {
    saveDenominationsToStorage();
    renderDenominationTable();
    updateKeypadScreen();
    updateReconciliationSummary();
}

// =====================================================
// 5. ĐỐI SOÁT QUỸ CA NÀY & LỊCH SỬ NỘP TIỀN CÁC ĐỢT
// =====================================================
function updateReconciliationSummary() {
    const totalCountedCash = calculateTotalCountedCash();
    const floatFund = shiftSummaryData.initialFloatFund;
    const cardQr = shiftSummaryData.cardAndQrRevenue;
    const expectedCash = shiftSummaryData.expectedCashInDrawer;

    // Tiền mặt thực nộp bàn giao = Tiền mặt kiểm đếm - Quỹ nổi ban đầu giữ lại két
    const actualHandoverCash = Math.max(0, totalCountedCash - floatFund);
    const difference = totalCountedCash - expectedCash;

    // Cập nhật chân bảng kiểm kê
    const totalCountedEl = document.getElementById('total-counted-cash');
    const footerSubEl = document.getElementById('denom-footer-subtext');
    if (totalCountedEl) totalCountedEl.innerText = formatCurrencyDong(totalCountedCash);

    // Cập nhật khung Đối Soát Quỹ Ca Này
    const recCountedEl = document.getElementById('reconcile-counted-cash');
    const recCardQrEl = document.getElementById('reconcile-card-qr');
    const recFloatEl = document.getElementById('reconcile-float-fund');
    const recHandoverEl = document.getElementById('reconcile-handover-cash');
    const statusPillEl = document.getElementById('reconcile-status-pill');

    if (recCountedEl) recCountedEl.innerText = formatCurrencyDong(totalCountedCash);
    if (recCardQrEl) recCardQrEl.innerText = formatCurrencyDong(cardQr);
    if (recFloatEl) recFloatEl.innerText = `-${formatCurrencyDong(floatFund)}`;
    if (recHandoverEl) recHandoverEl.innerHTML = `${formatNumberVN(actualHandoverCash)}<br>đ`;

    // Trạng thái khớp / lệch quỹ
    if (statusPillEl && footerSubEl) {
        if (difference === 0) {
            statusPillEl.className = 'status-match-pill';
            statusPillEl.innerText = '● Khớp 100%';
            footerSubEl.innerText = 'Khớp với kiểm kê thực tế';
        } else if (difference > 0) {
            statusPillEl.className = 'status-match-pill diff';
            statusPillEl.innerText = `● Dư +${formatCurrencyDong(difference)}`;
            footerSubEl.innerText = `Dư ${formatCurrencyDong(difference)} so với hệ thống`;
        } else {
            statusPillEl.className = 'status-match-pill diff';
            statusPillEl.innerText = `● Lệch ${formatCurrencyDong(difference)}`;
            footerSubEl.innerText = `Thiếu ${formatCurrencyDong(Math.abs(difference))} so với hệ thống`;
        }
    }
}

function renderHandoverHistory() {
    const container = document.getElementById('handover-history-list');
    const countBadge = document.getElementById('history-count-badge');
    if (!container) return;

    const historyList = getHandoverHistoryFromStorage();

    if (countBadge) {
        const formattedCount = String(historyList.length).padStart(2, '0');
        countBadge.innerHTML = `${formattedCount} đợt<br>giao`;
    }

    container.innerHTML = '';

    historyList.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item';
        itemEl.innerHTML = `
            <div class="history-item-top">
                <div class="history-time-group">
                    <span class="history-num-circle">${idx + 1}</span>
                    <span class="history-date">${item.date}</span>
                    <span class="history-clock">${item.time}</span>
                </div>
                <span class="history-status-pill">✓ ${item.status || 'Đã duyệt'}</span>
            </div>
            <div class="history-staff-name">${item.staffName}</div>
            <div class="history-total-submit">Tiền nộp: ${formatCurrencyVND(item.totalSubmit)}</div>
            <div class="history-detail-row">
                <span>• Tiền VNĐ:</span>
                <span>${formatCurrencyVND(item.cashVnd)}</span>
            </div>
            <div class="history-detail-row">
                <span>• Ngân hàng:</span>
                <span>${formatCurrencyVND(item.bankTransfer)}</span>
            </div>
        `;
        container.appendChild(itemEl);
    });
}

// =====================================================
// 6. XỬ LÝ PHÍM TẮT, MỞ KÉT TIỀN & MODAL BÀN GIAO CA
// =====================================================
function handleGlobalKeyDown(e) {
    if (e.key === 'Escape') {
        closeAllModals();
        return;
    }

    if (e.key === 'F10') {
        e.preventDefault();
        openCashDrawer();
        return;
    }

    // Không nhận phím số khi đang mở Modal xác nhận
    const overlay = document.getElementById('modal-overlay');
    if (overlay && overlay.style.display === 'flex') return;

    if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        pressNumKey(e.key);
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        pressBackspace();
    } else if (e.key === 'Delete') {
        e.preventDefault();
        pressClear();
    } else if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault();
        moveToNextDenom();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveToPrevDenom();
    }
}

function openCashDrawer() {
    if (window.javaBackend && typeof window.javaBackend.moKetTien === 'function') {
        window.javaBackend.moKetTien();
    } else {
        alert("Đã gửi lệnh mở két tiền (F10) đến Máy in Bill #1!");
    }
}

function closeAllModals() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
    const modals = document.querySelectorAll('.modal-box');
    modals.forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        closeAllModals();
    }
}

function openConfirmHandoverModal() {
    closeAllModals();

    const totalCountedCash = calculateTotalCountedCash();
    const cardQr = shiftSummaryData.cardAndQrRevenue;
    const actualHandoverCash = Math.max(0, totalCountedCash - shiftSummaryData.initialFloatFund);

    const staffEl = document.getElementById('modal-staff-name');
    const countedEl = document.getElementById('modal-counted-cash');
    const cardQrEl = document.getElementById('modal-card-qr');
    const handoverEl = document.getElementById('modal-handover-cash');

    if (staffEl) staffEl.innerText = tennhanviendangnhap;
    if (countedEl) countedEl.innerText = formatCurrencyDong(totalCountedCash);
    if (cardQrEl) cardQrEl.innerText = formatCurrencyDong(cardQr);
    if (handoverEl) handoverEl.innerText = formatCurrencyDong(actualHandoverCash);

    const overlay = document.getElementById('modal-overlay');
    const modalBox = document.getElementById('modal-handover-confirm');
    if (overlay) overlay.style.display = 'flex';
    if (modalBox) modalBox.style.display = 'block';
}

async function confirmAndPrintHandover() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });

    const totalCountedCash = calculateTotalCountedCash();
    const actualHandoverCash = Math.max(0, totalCountedCash - shiftSummaryData.initialFloatFund);
    const bankAmount = shiftSummaryData.cardAndQrRevenue;
    const totalSubmitAmount = actualHandoverCash + bankAmount;

    const newRecord = {
        id: Date.now(),
        date: dateStr,
        time: timeStr,
        status: 'Đã duyệt',
        staffName: tennhanviendangnhap.toUpperCase(),
        totalSubmit: totalSubmitAmount,
        cashVnd: actualHandoverCash,
        bankTransfer: bankAmount
    };

    // Gửi dữ liệu lên REST API nếu có backend
    try {
        await fetch(KETCA_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                staffId: idnhanviendangnhap,
                staffName: tennhanviendangnhap,
                countedCash: totalCountedCash,
                cardQrRevenue: bankAmount,
                floatFund: shiftSummaryData.initialFloatFund,
                handoverCash: actualHandoverCash,
                denominations: denominationsState
            })
        });
    } catch (e) {
        // Fallback lưu localStorage nếu chưa chạy API
    }

    const historyList = getHandoverHistoryFromStorage();
    historyList.unshift(newRecord);
    saveHandoverHistoryToStorage(historyList);
    renderHandoverHistory();

    closeAllModals();

    if (window.javaBackend && typeof window.javaBackend.inBienBanKetCa === 'function') {
        window.javaBackend.inBienBanKetCa(JSON.stringify(newRecord));
    } else {
        alert("Đã in biên bản và xác nhận bàn giao ca thành công!");
    }
}