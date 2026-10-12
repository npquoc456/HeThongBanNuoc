function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    const targetWidth = 1440;
    const targetHeight = 1080;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const scale = Math.min(windowWidth / targetWidth, windowHeight / targetHeight);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

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

    loadcustomberfromapi();
});

let customersDB = [];
let customerLoadError = null;
let currentCustomerPage = 1;
let customerFilter = 'all';
const customersPerPage = 7;

function normalizeCustomerId(id) {
    const value = String(id ?? '').trim();
    if (!/^\d+$/.test(value)) return null;

    const numericId = Number(value);
    if (!Number.isSafeInteger(numericId) || numericId <= 0 || numericId > 2147483647) return null;
    return String(numericId);
}

async function responseErrorMessage(response, fallback) {
    const message = (await response.text()).trim();
    if (message) {
        try {
            const body = JSON.parse(message);
            return body.message || body.error || message;
        } catch (error) {
            return message;
        }
    }
    return `${fallback} (HTTP ${response.status})`;
}

async function loadcustomberfromapi() {
    try {
        let response = await fetch('http://localhost:8080/api/tktrungthanh');
        if(!response.ok) {
            throw new Error("Lỗi máy chủ: " + response.status);
        }
        const data = await response.json(); 

        customersDB = data.map(tk => {
            return {
                id: tk.id ? tk.id.toString() : "", 
                name: tk.tenKH || "",
                points: tk.soLuongMua !== undefined ? tk.soLuongMua : 0, 
                date: tk.ngayTao || ""
            };
        });
        customerLoadError = null;
        renderCustomers();
    } catch(error) {
        console.error("Không thể tải dữ liệu tài khoản tích điểm từ API:", error);
        customersDB = [];
        customerLoadError = error.message || "Không thể tải dữ liệu tài khoản tích điểm.";
        renderCustomers();
    }
}

// Mã SVG Icon Edit
const editIconSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;

function renderCustomers() {
    const container = document.getElementById('customer-container');
    if (!container) return;
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    container.innerHTML = '';
    
    const filtered = customersDB.filter(c => {
        const matchesSearch = c.id.toLowerCase().includes(keyword) || c.name.toLowerCase().includes(keyword);
        const points = Number(c.points) || 0;
        const matchesFilter = customerFilter === 'all'
            || (customerFilter === 'almost-reward' && points >= 7 && points < 10)
            || (customerFilter === 'reward-ready' && points >= 10);
        return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
    });
    const totalPages = Math.max(1, Math.ceil(filtered.length / customersPerPage));
    currentCustomerPage = Math.min(Math.max(currentCustomerPage, 1), totalPages);
    const startIndex = (currentCustomerPage - 1) * customersPerPage;
    const pageCustomers = filtered.slice(startIndex, startIndex + customersPerPage);

    let totalMembers = customersDB.length;
    let totalEligible = customersDB.filter(c => c.points >= 10).length;
    
    const totalMembersEl = document.getElementById('total-members-val');
    const eligibleEl = document.getElementById('eligible-discount-val');
    if(totalMembersEl) totalMembersEl.innerHTML = `${totalMembers.toLocaleString()} <span>khách</span>`;
    if(eligibleEl) eligibleEl.innerHTML = `${totalEligible} <span style="color: #15803d; font-size: 13px; font-weight: 600;">Sẵn sàng dùng</span>`;

    const paginationText = document.getElementById('pagination-text');
    if(paginationText) {
        const firstVisible = filtered.length ? startIndex + 1 : 0;
        const lastVisible = Math.min(startIndex + customersPerPage, filtered.length);
        paginationText.innerText = `Hiển thị ${firstVisible}–${lastVisible} trên ${filtered.length} khách hàng`;
    }
    const pageInfo = document.getElementById('customer-page-info');
    if (pageInfo) pageInfo.innerText = `Trang ${currentCustomerPage}/${totalPages}`;
    const previousButton = document.getElementById('customer-page-previous');
    const nextButton = document.getElementById('customer-page-next');
    if (previousButton) previousButton.disabled = currentCustomerPage === 1;
    if (nextButton) nextButton.disabled = currentCustomerPage === totalPages;
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.filter === customerFilter);
    });

    if (filtered.length === 0) {
        container.textContent = customerLoadError
            || (customersDB.length === 0
                ? "Chưa có tài khoản tích điểm trong cơ sở dữ liệu."
                : "Không tìm thấy tài khoản phù hợp.");
    }
    
    pageCustomers.forEach(c => {
        const points = Number(c.points) || 0;
        const progressPercent = Math.min(Math.round((points / 10) * 100), 100);
        const firstLetter = c.name ? c.name.charAt(0).toUpperCase() : "C";
        const isVIP = points >= 7;
        
        let rankSub = "Thành viên Mới";
        if (points >= 7) rankSub = "Thành viên Thân Thiết";
        if (points >= 10) rankSub = "Thành viên VIP Bạc";

        let noteHTML = "";
        if (points >= 7 && points < 10) {
            noteHTML = `<div style="font-size: 11px; color: #b45309; font-weight: bold; margin-top: 2px;">Chỉ còn ${10 - points} ly để nhận 40% OFF</div>`;
        }

        const badgeClass = points >= 7 ? "points-badge highlight" : "points-badge";

        container.innerHTML += `
            <div class="table-row">
                <span style="font-weight: bold;">${c.id}</span>
                <div class="customer-info-cell">
                    <div class="customer-avatar">${firstLetter}</div>
                    <div class="customer-details">
                        <div class="customer-name">${c.name}</div>
                        <div class="customer-rank">${rankSub}</div>
                        ${noteHTML}
                    </div>
                </div>
                <div class="progress-cell">
                    <div class="progress-info">
                        <span>${points}/10 ly</span>
                        <span>${progressPercent}%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                </div>
                <span>${c.date}</span>
                <div>
                    <div class="${badgeClass}">${points}</div>
                </div>
                <div class="action-icons">
                    <img src="ICONS/viewicon.png" alt="View" onclick="openViewModal('${c.id}')" title="Xem">
                    <span onclick="openEditModal('${c.id}')" title="Sửa">${editIconSVG}</span>
                    <img src="ICONS/Deleteicon.png" alt="Delete" onclick="openDeleteModal('${c.id}')" title="Xóa">
                </div>
            </div>
        `;
    });
}

function changeCustomerPage(page) {
    currentCustomerPage = page;
    renderCustomers();
}

function setCustomerFilter(filter) {
    customerFilter = filter;
    currentCustomerPage = 1;
    renderCustomers();
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

let currentEditId = null;
let currentDeleteId = null;
let tempCustomerData = null;

function openCreateModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-create').style.display = 'block';
    
    document.getElementById('create-phone').value = '';
    document.getElementById('create-name').value = '';
}

async function submitCreateForm() {
    const phone = document.getElementById('create-phone').value.trim();
    const name = document.getElementById('create-name').value.trim();
    
    if(!phone || !name) { 
        alert("Vui lòng nhập đầy đủ Số điện thoại và Họ tên!"); 
        return; 
    }

    const customerId = normalizeCustomerId(phone);
    if(!customerId) {
        alert("Số điện thoại phải là số nguyên dương phù hợp với ID tài khoản.");
        return;
    }
    
    if(customersDB.some(c => normalizeCustomerId(c.id) === customerId)) {
        alert("Số điện thoại này đã tồn tại trong hệ thống!"); 
        return;
    }

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const createDate = `${year}-${month}-${day}`;
    
    tempCustomerData = {
        id: customerId,
        name: name,
        points: 0, 
        date: createDate
    };

    document.getElementById('confirm-phone').innerText = phone;
    document.getElementById('confirm-name').innerText = name;
    document.getElementById('confirm-date').innerText = createDate;

    document.getElementById('modal-create').style.display = 'none';
    document.getElementById('modal-confirm-create').style.display = 'block';
}

async function confirmAndSaveAccount() {
    if(tempCustomerData) {
        const dto = {
            id: Number(tempCustomerData.id),
            tenKH: tempCustomerData.name,
            soLuongMua: tempCustomerData.points,
            ngayTao: tempCustomerData.date
        };

        try {
            const response = await fetch('http://localhost:8080/api/tktrungthanh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            if(!response.ok) {
                throw new Error(await responseErrorMessage(response, "Không thể tạo tài khoản tích điểm."));
            }
            const created = await response.json();
            customersDB.push({
                id: String(created.id),
                name: created.tenKH,
                points: created.soLuongMua ?? 0,
                date: created.ngayTao || tempCustomerData.date
            });
        } catch (error) {
            console.error("Lỗi tạo tài khoản tích điểm:", error);
            alert(error.message || "Không thể tạo tài khoản tích điểm.");
            return;
        }

        tempCustomerData = null;            
        
        closeAllModals();
        renderCustomers(); 
    }
}

function openViewModal(id) {
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-view').style.display = 'block';

    document.getElementById('view-phone').innerText = customer.id;
    document.getElementById('view-name').innerText = customer.name;
    document.getElementById('view-date').innerText = customer.date;
    document.getElementById('view-points').innerText = customer.points;
}

function openEditModal(id) {
    currentEditId = id;
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-edit').style.display = 'block';
    
    document.getElementById('edit-phone').value = customer.id;
    document.getElementById('edit-name').value = customer.name;
    document.getElementById('edit-points').value = customer.points;
}

async function submitEdit() {
    const name = document.getElementById('edit-name').value.trim();
    let points = parseInt(document.getElementById('edit-points').value);

    if(!name || isNaN(points) || points < 0) { 
        alert("Vui lòng nhập thông tin Tên và Điểm hợp lệ!"); 
        return; 
    }

    // LOGIC TỰ ĐỘNG RESET: Nếu đạt hoặc vượt mốc 10 điểm (sau khi dùng ưu đãi giảm 40%)
    if (points >= 10) {
        // Tùy chọn 1: Reset hẳn về 0 để tích lại từ đầu vòng mới
        points = points - 10; // Hoặc gán trực tiếp bằng 0 nếu muốn reset sạch: points = 0;
        alert("Khách hàng đã đủ điều kiện nhận ưu đãi 40%! Điểm tích lũy đã được reset cho chu kỳ mới.");
    }

    const index = customersDB.findIndex(c => c.id === currentEditId);
    if(index !== -1) {
        const dto = {
            tenKH: name,
            soLuongMua: points
        };
        try {
            const response = await fetch(`http://localhost:8080/api/tktrungthanh/${currentEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            if(!response.ok) {
                throw new Error(await responseErrorMessage(response, "Không thể cập nhật tài khoản."));
            }
        } catch (error) {
            console.error("Lỗi cập nhật tài khoản tích điểm:", error);
            alert(error.message || "Không thể cập nhật tài khoản tích điểm.");
            return;
        }
        customersDB[index].name = name;
        customersDB[index].points = points;
        closeAllModals();
        renderCustomers();
    }
}

function openDeleteModal(id) {
    currentDeleteId = id;
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-delete').style.display = 'block';

    document.getElementById('del-phone').innerText = customer.id;
    document.getElementById('del-name').innerText = customer.name;
}

async function submitDelete() {
    const customerId = normalizeCustomerId(currentDeleteId);
    if (!customerId) {
        alert("ID tài khoản không hợp lệ. Vui lòng tải lại danh sách rồi thử lại.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/tktrungthanh/${customerId}`, {
            method: 'DELETE'
        });
        if(!response.ok) {
            throw new Error(await responseErrorMessage(response, "Không thể xóa tài khoản."));
        }
    } catch (error) {
        console.error("Lỗi xóa tài khoản tích điểm:", error);
        alert(error.message || "Không thể xóa tài khoản tích điểm.");
        return;
    }

    customersDB = customersDB.filter(c => normalizeCustomerId(c.id) !== customerId);
    closeAllModals();
    renderCustomers();
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