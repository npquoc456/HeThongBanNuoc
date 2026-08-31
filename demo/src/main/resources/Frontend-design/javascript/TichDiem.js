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

let customersDB = [];

async function loadcustomberfromapi() {
    try{
        let response = await fetch('http://localhost:8080/api/tktrungthanh')
        if(!response.ok){
            throw new Error("loi may chu: " + response.status);
        }
        const data = await response.json(); 

        customersDB = data.map( tk => {
            return {
                id: tk.id.toString(), 
                name: tk.tenKH,
                points: tk.soLuongMua, 
                date: tk.ngayTao
            };
        });
        renderCustomers();
    }
    catch(error){
        console.error("khong the load du lieu dao vao cua KH ", error);
        // Fake data mẫu nếu chưa chạy Spring Boot
        customersDB = [
            { id: "07535726547", name: "Thịnh Suy", points: 10, date: "25/05/2015" },
            { id: "03263874626", name: "Đức Lọ", points: 5, date: "30/06/2024" }
        ];
        renderCustomers();
    }
}

loadcustomberfromapi();

// Mã SVG Icon Edit
const editIconSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;

function renderCustomers() {
    const container = document.getElementById('customer-container');
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    container.innerHTML = '';
    
    const filtered = customersDB.filter(c => 
        c.id.includes(keyword) || c.name.toLowerCase().includes(keyword)
    );

    filtered.forEach(c => {
        container.innerHTML += `
            <div class="customer-item row-grid">
                <span>${c.id}</span>
                <span class="name">${c.name}</span>
                <span>${c.date}</span>
                <span>${c.points}</span>
                <div class="action-icons">
                    <img src="ICONS/viewicon.png" alt="View" onclick="openViewModal('${c.id}')">
                    <span onclick="openEditModal('${c.id}')">${editIconSVG}</span>
                    <img src="ICONS/Deleteicon.png" alt="Delete" onclick="openDeleteModal('${c.id}')">
                </div>
            </div>
        `;
    });
}

function updateCurrentTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN');
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime();

function chuyentrang(trang) {
    if(window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        console.log("Chuyển trang: " + trang);
    }
}


/* =======================================================================
   ================= PHẦN LOGIC THÊM - SỬA - XÓA - XEM ===================
   ======================================================================= */

let currentEditId = null;
let currentDeleteId = null;
let tempCustomerData = null; // Biến lưu tạm dữ liệu trước khi "TẠO"

// ----- MỞ BẢNG ĐIỀN THÔNG TIN TẠO MỚI -----
function openCreateModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-create').style.display = 'block';
    
    // Clear Form
    document.getElementById('create-phone').value = '';
    document.getElementById('create-name').value = '';
}

// ----- XỬ LÝ NÚT XÁC NHẬN VÀ HIỂN THỊ BẢNG CONFIRM TẠO MỚI -----
function submitCreateForm() {
    const phone = document.getElementById('create-phone').value.trim();
    const name = document.getElementById('create-name').value.trim();
    
    if(!phone || !name) { 
        alert("Vui lòng nhập đầy đủ Số điện thoại và Họ tên!"); 
        return; 
    }
    
    // Check trùng SĐT
    if(customersDB.some(c => c.id === phone)) {
        alert("Số điện thoại này đã tồn tại trong hệ thống!"); 
        return;
    }

    const createDate = new Date().toLocaleDateString('vi-VN');
    
    // Lưu tạm vào biến
    tempCustomerData = {
        id: phone,
        name: name,
        points: 0, 
        date: createDate
    };

    // Bơm dữ liệu vào bảng Confirm
    document.getElementById('confirm-phone').innerText = phone;
    document.getElementById('confirm-name').innerText = name;
    document.getElementById('confirm-date').innerText = createDate;

    // Chuyển sang Modal Confirm
    document.getElementById('modal-create').style.display = 'none';
    document.getElementById('modal-confirm-create').style.display = 'block';
}

// ----- LƯU CHÍNH THỨC VÀO ARRAY (KHI BẤM 'TẠO') -----
function confirmAndSaveAccount() {
    if(tempCustomerData) {
        customersDB.push(tempCustomerData); 
        tempCustomerData = null;            
        
        alert("Tạo tài khoản thành công!");
        closeAllModals();
        renderCustomers(); 
    }
}

// ----- XEM TÀI KHOẢN (ICON CON MẮT) -----
function openViewModal(id) {
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-view').style.display = 'block';

    // Đổ thông tin vào bảng View
    document.getElementById('view-phone').innerText = customer.id;
    document.getElementById('view-name').innerText = customer.name;
    document.getElementById('view-date').innerText = customer.date;
    document.getElementById('view-points').innerText = customer.points;
}


// ----- SỬA TÀI KHOẢN -----
function openEditModal(id) {
    currentEditId = id;
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-edit').style.display = 'block';
    
    // Đổ dữ liệu vào Form
    document.getElementById('edit-phone').value = customer.id;
    document.getElementById('edit-name').value = customer.name;
    document.getElementById('edit-points').value = customer.points;
}

function submitEdit() {
    const name = document.getElementById('edit-name').value.trim();
    const points = parseInt(document.getElementById('edit-points').value);

    if(!name || isNaN(points) || points < 0) { 
        alert("Vui lòng nhập thông tin Tên và Điểm hợp lệ!"); 
        return; 
    }

    const index = customersDB.findIndex(c => c.id === currentEditId);
    if(index !== -1) {
        customersDB[index].name = name;
        customersDB[index].points = points;
        alert("Cập nhật thông tin thành công!");
        closeAllModals();
        renderCustomers();
    }
}


// ----- XÓA TÀI KHOẢN -----
function openDeleteModal(id) {
    currentDeleteId = id;
    const customer = customersDB.find(c => c.id === id);
    if(!customer) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-delete').style.display = 'block';

    // Đổ thông tin vào bảng
    document.getElementById('del-phone').innerText = customer.id;
    document.getElementById('del-name').innerText = customer.name;
}

function submitDelete() {
    // Lọc bỏ id cần xóa ra khỏi mảng
    customersDB = customersDB.filter(c => c.id !== currentDeleteId);
    
    alert("Đã xóa tài khoản!");
    closeAllModals();
    renderCustomers();
}

// ----- ĐÓNG MODAL CHUNG -----
function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    const modals = document.querySelectorAll('.modal-box');
    modals.forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        closeAllModals();
    }
}