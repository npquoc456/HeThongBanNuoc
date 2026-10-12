let idnhanviendangnhap = localStorage.getItem('POS_STAFF_ID');
let tennhanviendangnhap = localStorage.getItem('POS_STAFF_NAME') || 'Nhân Viên';

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
});
      
function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    const targetWidth = 1440; const targetHeight = 1080;
    const windowWidth = window.innerWidth; const windowHeight = window.innerHeight;
    const scale = Math.min(windowWidth / targetWidth, windowHeight / targetHeight);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

let ingredientsDB = [];
let currentPage = 1;
const itemsPerPage = 10;
let ingredientsLoadError = null;

async function getApiErrorMessage(response, fallback) {
    const message = (await response.text()).trim();
    if (!message) return `${fallback} (HTTP ${response.status})`;
    try {
        const body = JSON.parse(message);
        return body.message || body.error || message;
    } catch (error) {
        return message;
    }
}

async function loadnguyenlieufromapi(){
    try {
        const response = await fetch('http://localhost:8080/api/nguyenlieu');
        if(!response.ok) {
            throw new Error(await getApiErrorMessage(response, "Không tải được nguyên liệu."));
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("API nguyên liệu trả về dữ liệu không hợp lệ.");
        }

        ingredientsDB = data.map(nl => {
            return {
                id: nl.id === null || nl.id === undefined ? "" : String(nl.id),
                name: nl.tenNL || "", 
                qty: nl.soLuong !== undefined ? nl.soLuong : 0, 
                unit: nl.donVi || nl.donvi || nl.unit || '',
                status: nl.trangThai || 'CON_HANG'
            };
        });
        ingredientsLoadError = null;
        renderIngredients(); 
    } catch(error) {
        console.error("Không thể tải dữ liệu nguyên liệu từ API:", error);
        ingredientsDB = [];
        ingredientsLoadError = error.message || "Không thể tải dữ liệu nguyên liệu từ API.";
        renderIngredients();
    }
}
loadnguyenlieufromapi();

const editIconSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;

const cartIconSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>`;

function renderIngredients() {
    const container = document.getElementById('data-container');
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    container.innerHTML = '';
    
    const filtered = ingredientsDB.filter(item => 
        item.id.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword)
    );

    const totalCount = ingredientsDB.length;
    const safeCount = ingredientsDB.filter(i => i.status === 'CON_HANG' && i.qty > 5).length;
    const warningCount = ingredientsDB.filter(i => i.status === 'SAP_HET' || i.status === 'CAN_NHAP' || i.qty <= 5).length;

    const statTotal = document.getElementById('stat-total');
    const statSafe = document.getElementById('stat-safe');
    const statWarning = document.getElementById('stat-warning');

    if(statTotal) statTotal.innerHTML = `${totalCount} <span>loại</span>`;
    if(statSafe) statSafe.innerHTML = `${safeCount} <span>loại</span>`;
    if(statWarning) statWarning.innerHTML = `${warningCount} <span>cần nhập</span>`;

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentList = filtered.slice(startIdx, endIdx);

    if (currentList.length === 0) {
        container.textContent = ingredientsLoadError || "Chưa có nguyên liệu trong cơ sở dữ liệu.";
    }

    const paginationText = document.getElementById('pagination-text');
    if(paginationText) {
        const displayStart = filtered.length > 0 ? startIdx + 1 : 0;
        const displayEnd = Math.min(endIdx, filtered.length);
        paginationText.innerText = `Hiển thị ${displayStart}–${displayEnd} trong tổng số ${filtered.length} mặt hàng nguyên liệu`;
    }

    currentList.forEach((item, index) => {
        let statusClass = 'con-hang';
        let statusText = '● Còn Hàng';
        
        if (item.status === 'SAP_HET' || item.qty <= 5) {
            statusClass = 'sap-het';
            statusText = '● Sắp Hết';
        } else if (item.status === 'CAN_NHAP') {
            statusClass = 'can-nhap';
            statusText = '● Cấn Nhập';
        }

        const absoluteIndex = startIdx + index + 1;
        const icon = getIngredientIcon(item.name);
        const actionIconLeft = (item.status === 'SAP_HET' || item.status === 'CAN_NHAP' || item.qty <= 5) ? `<span title="Nhập hàng" style="width:20px; height:20px; display:inline-flex; align-items:center; cursor:pointer;">${cartIconSVG}</span>` : `<img src="ICONS/viewicon.png" alt="View" onclick="openViewNlModal('${item.id}')" title="Xem">`;

        container.innerHTML += `
            <div class="table-row">
                <span style="font-weight: bold; padding-left: 10px;">${absoluteIndex}</span>
                <div class="item-info-cell">
                    <div class="item-icon-box">${icon}</div>
                    <div class="item-details">
                        <div class="item-name">${item.name}</div>
                        <div class="item-sub">Nguyên liệu pha chế chính</div>
                    </div>
                </div>
                <span style="font-weight: bold; font-size: 15px;">${item.qty}</span>
                <span style="font-weight: 500; color: #555;">${item.unit}</span>
                <div>
                    <span class="status-pill ${statusClass}">${statusText}</span>
                </div>
                <div class="action-icons">
                    ${actionIconLeft}
                    <span onclick="openEditNlModal('${item.id}')" title="Sửa">${editIconSVG}</span>
                    <img src="ICONS/Deleteicon.png" alt="Delete" onclick="openDeleteNlModal('${item.id}')" title="Xóa">
                </div>
            </div>
        `;
    });

    renderPaginationControls(totalPages);
}

function getIngredientIcon(name) {
    const normalizedName = name.toLowerCase();
    let drawing = '<path d="M7 5h10v15H7z"/><path d="M9 5V3h6v2M9 10h6"/>';

    if (/ca phe|cà phê|coffee/.test(normalizedName)) {
        drawing = '<path d="M5 9h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9Z"/><path d="M17 11h1a3 3 0 0 1 0 6h-2M8 5c-1-1 1-2 0-3M12 5c-1-1 1-2 0-3"/>';
    } else if (/sua|sữa|kem|cream|whipping/.test(normalizedName)) {
        drawing = '<path d="M8 4h8l1 3-1 13H8L7 7l1-3Z"/><path d="M7 8h10M10 4V2h4v2"/>';
    } else if (/tra|trà|matcha|la|lá|sa|sả/.test(normalizedName)) {
        drawing = '<path d="M5 19c2-8 8-13 15-14-1 7-6 13-15 14Z"/><path d="M6 18c3-4 6-7 11-10"/>';
    } else if (/cam|chanh|quyt|quýt/.test(normalizedName)) {
        drawing = '<circle cx="12" cy="13" r="7"/><path d="M12 6c1-2 3-3 5-3M12 6v7l5-4M12 13l-5-4M12 13l-3 6M12 13l6 4"/>';
    } else if (/dao|đào|vai|vải|dau|dâu|nho|táo/.test(normalizedName)) {
        drawing = '<path d="M12 8c-5-4-9 0-7 6 1 4 4 7 7 4 3 3 6 0 7-4 2-6-2-10-7-6Z"/><path d="M12 8c0-3 2-5 5-5-1 3-2 4-5 5Z"/>';
    } else if (/oreo|banh|bánh|thach|thạch/.test(normalizedName)) {
        drawing = '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="m9 9 1 1m4 4 1 1m0-6-1 1m-4 4-1 1"/>';
    } else if (/duong|đường|bot|bột|hat|hạt/.test(normalizedName)) {
        drawing = '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Z"/><path d="m4 8 8 5 8-5M12 13v8"/>';
    }

    return `<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="#b45309" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${drawing}</svg>`;
}

function renderPaginationControls(totalPages) {
    const paginationControls = document.getElementById('pagination-controls');
    if(!paginationControls) return;

    let html = `<button class="page-btn" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>←</button>`;

    for(let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>→</button>`;
    paginationControls.innerHTML = html;
}

function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    renderIngredients();
}

function updateCurrentTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN');
    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');
    if(dateEl) dateEl.textContent = dateStr;
    if(timeEl) timeEl.textContent = timeStr;
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime();

function chuyentrang(trang) {
    if(window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        window.location.href = trang;
    }
}

let currentEditNlId = null;
let tempNlData = null;

function updateStatusBadge() {
    const qtyInput = document.getElementById('form-qty').value;
    const qty = parseFloat(qtyInput);
    const badge = document.getElementById('form-status-badge');
    
    if (!isNaN(qty) && qty <= 0) {
        badge.textContent = 'HẾT HÀNG';
        badge.style.backgroundColor = '#B30000';
    } else {
        badge.textContent = 'CÒN HÀNG';
        badge.style.backgroundColor = '#008A5A';
    }
}

function openCreateNlModal() {
    closeAllModals();
    currentEditNlId = null; 
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-form').style.display = 'block';
    
    document.getElementById('modal-form-title').innerText = "Thêm nguyên liệu";
    document.getElementById('form-name').value = '';
    document.getElementById('form-qty').value = '';
    document.getElementById('form-unit').value = 'Kg';
    
    updateStatusBadge();
}

function openEditNlModal(id) {
    const item = ingredientsDB.find(i => i.id === id);
    if(!item) return;

    closeAllModals();
    currentEditNlId = id; 
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-form').style.display = 'block';

    document.getElementById('modal-form-title').innerText = "Sửa nguyên liệu";
    document.getElementById('form-name').value = item.name;
    document.getElementById('form-qty').value = item.qty;
    
    const unitSelect = document.getElementById('form-unit');
    const dbUnit = (item.unit || '').trim().toLowerCase();
    let isMatched = false;
    
    for (let i = 0; i < unitSelect.options.length; i++) {
        if (unitSelect.options[i].value.toLowerCase() === dbUnit) {
            unitSelect.selectedIndex = i;
            isMatched = true;
            break;
        }
    }
    
    if (!isMatched && item.unit) {
        const newOption = document.createElement("option");
        newOption.value = item.unit;
        newOption.text = item.unit;
        unitSelect.appendChild(newOption);
        unitSelect.value = item.unit;
    }

    updateStatusBadge();
}

function submitNlForm() {
    const name = document.getElementById('form-name').value.trim();
    const qty = parseFloat(document.getElementById('form-qty').value);
    const unit = document.getElementById('form-unit').value;

    if(!name || isNaN(qty)) { 
        alert("Vui lòng nhập tên và số lượng nguyên liệu hợp lệ!"); 
        return; 
    }

    const statusEnum = (qty <= 0) ? "HET_HANG" : "CON_HANG";
    const statusText = (qty <= 0) ? "Hết hàng" : "Còn hàng";

    tempNlData = {
        id: currentEditNlId || "Mới",
        name: name,
        qty: qty,
        unit: unit,
        status: statusEnum
    };

    document.getElementById('confirm-id').innerText = tempNlData.id;
    document.getElementById('confirm-name').innerText = name;
    document.getElementById('confirm-qty').innerText = `${qty} ${unit}`;
    
    const statusBox = document.getElementById('confirm-status-box');
    document.getElementById('confirm-status').innerText = statusText;
    if (qty <= 0) {
        statusBox.style.backgroundColor = '#B30000';
    } else {
        statusBox.style.backgroundColor = '#008A5A';
    }

    document.getElementById('confirm-btn-group').style.display = 'flex';
    if(currentEditNlId) {
        document.getElementById('confirm-title').innerText = "Sửa nguyên liệu";
        document.getElementById('confirm-subtitle').innerText = "Xác nhận cập nhật nguyên liệu";
        document.getElementById('confirm-submit-btn').innerText = "CẬP NHẬT";
    } else {
        document.getElementById('confirm-title').innerText = "Thêm nguyên liệu";
        document.getElementById('confirm-subtitle').innerText = "Xác nhận thông tin nguyên liệu";
        document.getElementById('confirm-submit-btn').innerText = "THÊM";
    }

    document.getElementById('modal-nl-form').style.display = 'none';
    document.getElementById('modal-nl-confirm').style.display = 'block';
}

async function confirmAndSaveNl() {
    if(!tempNlData) return;

    if (currentEditNlId) {
       const dto = {
            tenNL: tempNlData.name,
            soLuong: tempNlData.qty,
            donVi: tempNlData.unit,
            trangThai: tempNlData.status
        };

        try {
            const response = await fetch(`http://localhost:8080/api/nguyenlieu/${currentEditNlId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response, "Không thể cập nhật nguyên liệu."));
            }
        } catch (error) {
            console.error("Lỗi cập nhật nguyên liệu:", error);
            alert(error.message || "Không thể cập nhật nguyên liệu.");
            return;
        }

        const index = ingredientsDB.findIndex(i => i.id === currentEditNlId);
        if(index !== -1) {
            ingredientsDB[index].name = tempNlData.name;
            ingredientsDB[index].qty = tempNlData.qty;
            ingredientsDB[index].unit = tempNlData.unit;
            ingredientsDB[index].status = tempNlData.status;
        }
    } else {
        const dto = {
            tenNL: tempNlData.name,
            soLuong: tempNlData.qty,
            donVi: tempNlData.unit,
            trangThai: tempNlData.status
        };

        try {
            const response = await fetch('http://localhost:8080/api/nguyenlieu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response, "Không thể thêm nguyên liệu."));
            }
            await loadnguyenlieufromapi();
            tempNlData = null;
            closeAllModals();
            return;
        } catch (error) {
            console.error("Lỗi thêm nguyên liệu:", error);
            alert(error.message || "Không thể thêm nguyên liệu.");
            return;
        }
    }

    tempNlData = null;
    closeAllModals();
    renderIngredients();
}

function openViewNlModal(id) {
    const item = ingredientsDB.find(i => i.id === id);
    if(!item) return;

    closeAllModals();
    
    document.getElementById('confirm-title').innerText = "Chi tiết nguyên liệu";
    document.getElementById('confirm-subtitle').innerText = "Thông tin chi tiết nguyên liệu";
    
    document.getElementById('confirm-id').innerText = item.id;
    document.getElementById('confirm-name').innerText = item.name;
    document.getElementById('confirm-qty').innerText = `${item.qty} ${item.unit}`;

    const statusText = item.status === 'CON_HANG' ? 'Còn hàng' : 'Hết hàng';
    const statusBox = document.getElementById('confirm-status-box');
    document.getElementById('confirm-status').innerText = statusText;
    
    if (item.status === 'HET_HANG') {
        statusBox.style.backgroundColor = '#B30000';
    } else {
        statusBox.style.backgroundColor = '#008A5A';
    }

    document.getElementById('confirm-btn-group').style.display = 'none'; 
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-confirm').style.display = 'block';
}

function closeAllModals() {
    const overlay = document.getElementById('modal-overlay');
    if(overlay) overlay.style.display = 'none';
    const modals = document.querySelectorAll('.modal-box');
    modals.forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        closeAllModals();
    }
}

let currentDeleteNlId = null;

function openDeleteNlModal(id) {
    currentDeleteNlId = id;
    const item = ingredientsDB.find(i => i.id === id);
    if(!item) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-delete').style.display = 'block';

    document.getElementById('del-nl-id').innerText = item.id;
    document.getElementById('del-nl-name').innerText = item.name;
}

async function submitDeleteNl() {
    try {
        const response = await fetch(`http://localhost:8080/api/nguyenlieu/${currentDeleteNlId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(await getApiErrorMessage(response, "Không thể xóa nguyên liệu."));
        }
    } catch (error) {
        console.error("Lỗi xóa nguyên liệu:", error);
        alert(error.message || "Không thể xóa nguyên liệu.");
        return;
    }

    ingredientsDB = ingredientsDB.filter(i => i.id !== currentDeleteNlId);
    closeAllModals();
    renderIngredients();
}