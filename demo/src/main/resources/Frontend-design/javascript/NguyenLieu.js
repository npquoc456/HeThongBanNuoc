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

async function loadnguyenlieufromapi(){
    try {
        const response = await fetch('http://localhost:8080/api/nguyenlieu')
        if(!response.ok) throw new Error("Lỗi máy chủ: " + response.status)

        const data = await response.json(); 
        
        ingredientsDB = data.map( nl => {
            return {
                id: nl.id.toString(),
                name: nl.tenNL, 
                qty: nl.soLuong, 
                unit: nl.donVi || nl.donvi || nl.unit || '',
                status: nl.trangThai
            };
        });
        renderIngredients(); 
    }
    catch(error){
        console.error("Không thể tải dữ liệu nguyên liệu: ", error);
        document.getElementById('data-container').innerHTML = 
        `<p style="color:red; text-align:center; padding-top:20px;">Lỗi kết nối Backend. Vui lòng kiểm tra lại Spring Boot.</p>`;
    }
}
loadnguyenlieufromapi();

const editIconSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>`;

function renderIngredients() {
    const container = document.getElementById('data-container');
    const keyword = document.getElementById('search-input').value.trim().toLowerCase();
    container.innerHTML = '';
    
    const filtered = ingredientsDB.filter(item => 
        item.id.toLowerCase().includes(keyword) || item.name.toLowerCase().includes(keyword)
    );

    filtered.forEach(item => {
        let textTrangThai = item.status === 'CON_HANG' ? 'Còn Hàng' : 'Hết Hàng';
        let colorTrangThai = item.status === 'HET_HANG' ? 'red' : 'green';

        container.innerHTML += `
            <div class="data-item row-grid">
                <span>${item.id}</span>
                <span class="name">${item.name}</span>
                <span>${item.qty}</span>
                <span style="font-weight: 500; color: #333;">${item.unit}</span>
                <span style="color: ${colorTrangThai}; font-weight: bold;">${textTrangThai}</span>
                <div class="action-icons">
                    <img src="ICONS/viewicon.png" alt="View" onclick="openViewNlModal('${item.id}')">
                    <span onclick="openEditNlModal('${item.id}')">${editIconSVG}</span>
                    <img src="ICONS/Deleteicon.png" alt="Delete" onclick="openDeleteNlModal('${item.id}')">
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
    window.javaBackend.loadTrang(trang);
}


/* =======================================================================
   ================= PHẦN LOGIC THÊM - SỬA - XEM =========================
   ======================================================================= */

let currentEditNlId = null;
let tempNlData = null; // Lưu tạm dữ liệu trước khi gửi

// 1. Tự động cập nhật bảng Trạng Thái khi nhập Số lượng
function updateStatusBadge() {
    const qtyInput = document.getElementById('form-qty').value;
    const qty = parseFloat(qtyInput);
    const badge = document.getElementById('form-status-badge');
    
    // Nếu khối lượng <= 0, đổi màu Đỏ, chữ Hết hàng
    if (!isNaN(qty) && qty <= 0) {
        badge.textContent = 'HẾT HÀNG';
        badge.style.backgroundColor = '#B30000';
    } else {
        badge.textContent = 'CÒN HÀNG';
        badge.style.backgroundColor = '#008A5A';
    }
}

// 2. MỞ FORM THÊM MỚI (DẤU +)
function openCreateNlModal() {
    closeAllModals();
    currentEditNlId = null; 
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-form').style.display = 'block';
    
    // Reset Form
    document.getElementById('modal-form-title').innerText = "Thêm nguyên liệu";
    document.getElementById('form-name').value = '';
    document.getElementById('form-qty').value = '';
    document.getElementById('form-unit').value = 'Kg';
    
    // Reset trạng thái mặc định
    updateStatusBadge();
}

// 3. MỞ FORM SỬA (ICON BÚT)
// 3. MỞ FORM SỬA (ICON BÚT)
function openEditNlModal(id) {
    const item = ingredientsDB.find(i => i.id === id);
    if(!item) return;

    closeAllModals();
    currentEditNlId = id; 
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-form').style.display = 'block';

    document.getElementById('modal-form-title').innerText = "Sửa nguyên liệu";
    
    // Đổ dữ liệu cơ bản
    document.getElementById('form-name').value = item.name;
    document.getElementById('form-qty').value = item.qty;
    
    // ĐÃ FIX: Xử lý chọn đúng Đơn vị bất kể viết hoa/thường
    const unitSelect = document.getElementById('form-unit');
    const dbUnit = (item.unit || '').trim().toLowerCase();
    let isMatched = false;
    
    // Quét qua các danh sách đơn vị đang có để đối chiếu
    for (let i = 0; i < unitSelect.options.length; i++) {
        if (unitSelect.options[i].value.toLowerCase() === dbUnit) {
            unitSelect.selectedIndex = i;
            isMatched = true;
            break;
        }
    }
    
    // Nếu Database trả về một đơn vị mới chưa từng có trong danh sách (VD: Thùng, Lon)
    // -> Tự động tạo thêm lựa chọn mới vào Select và chọn nó
    if (!isMatched && item.unit) {
        const newOption = document.createElement("option");
        newOption.value = item.unit;
        newOption.text = item.unit;
        unitSelect.appendChild(newOption);
        unitSelect.value = item.unit;
    }

    // Cập nhật lại màu trạng thái
    updateStatusBadge();
}

// 4. XỬ LÝ NÚT XÁC NHẬN VÀ HIỆN FORM XÁC NHẬN (ẢNH 3)
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

    // Lưu biến tạm (Nếu Thêm mới -> ID để là "Tự tạo")
    tempNlData = {
        id: currentEditNlId || "Mới",
        name: name,
        qty: qty,
        unit: unit,
        status: statusEnum
    };

    // Đổ dữ liệu sang bảng Xác Nhận (Ảnh 3)
    document.getElementById('confirm-id').innerText = tempNlData.id;
    document.getElementById('confirm-name').innerText = name;
    document.getElementById('confirm-qty').innerText = `${qty} ${unit}`;
    
    // Đổi màu box trạng thái
    const statusBox = document.getElementById('confirm-status-box');
    document.getElementById('confirm-status').innerText = statusText;
    if (qty <= 0) {
        statusBox.style.backgroundColor = '#B30000'; // Đỏ
    } else {
        statusBox.style.backgroundColor = '#008A5A'; // Xanh
    }

    // Gắn Tiêu đề và Hiện/Ẩn Nút
    document.getElementById('confirm-btn-group').style.display = 'flex'; // Chắc chắn hiện cụm nút
    if(currentEditNlId) {
        document.getElementById('confirm-title').innerText = "Sửa nguyên liệu";
        document.getElementById('confirm-subtitle').innerText = "Xác nhận cập nhật nguyên liệu";
        document.getElementById('confirm-submit-btn').innerText = "CẬP NHẬT";
    } else {
        document.getElementById('confirm-title').innerText = "Thêm nguyên liệu";
        document.getElementById('confirm-subtitle').innerText = "Xác nhận thông tin nguyên liệu";
        document.getElementById('confirm-submit-btn').innerText = "THÊM";
    }

    // Đổi view
    document.getElementById('modal-nl-form').style.display = 'none';
    document.getElementById('modal-nl-confirm').style.display = 'block';
}

// 5. NÚT THÊM / CẬP NHẬT CHÍNH THỨC (GỌI API)
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
                throw new Error(`Lỗi khi cập nhật nguyên liệu: ${response.status}`);
            }
        } catch (error) {
            console.error("Lỗi khi gọi API PUT:", error);
            alert("Lỗi kết nối Backend khi cập nhật nguyên liệu!");
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
                throw new Error(`Lỗi khi thêm nguyên liệu: ${response.status}`);
            }
            loadnguyenlieufromapi(); // Tải lại danh sách từ Backend để lấy ID thực
            const createdItem = await response.json();
            tempNlData.id = createdItem.id.toString(); // Lấy ID thực từ Backend
        }
        catch (error) {
            console.error("Lỗi khi gọi API POST:", error);
            alert("Lỗi kết nối Backend khi thêm nguyên liệu!");
            return;
        }

        tempNlData.id = Math.floor(Math.random() * 1000).toString(); // Fake ID khi chưa có Backend
        ingredientsDB.push(tempNlData);
    }

    tempNlData = null;
    closeAllModals();
    renderIngredients();
}

// 6. XEM CHI TIẾT (ICON MẮT) - Form giống Ảnh 3 nhưng ẩn nút bấm
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

    // Ẩn cụm nút Xác nhận/Hủy
    document.getElementById('confirm-btn-group').style.display = 'none'; 

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-confirm').style.display = 'block';
}

// 7. ĐÓNG MODAL CHUNG
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

// ================================================ alert("Thêm nguyên liệu thành công!");=======
// 8. CHỨC NĂNG XÓA NGUYÊN LIỆU
// =======================================================
let currentDeleteNlId = null;

// Hàm mở form xác nhận Xóa
function openDeleteNlModal(id) {
    currentDeleteNlId = id;
    const item = ingredientsDB.find(i => i.id === id);
    if(!item) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-nl-delete').style.display = 'block';

    // Đổ thông tin lên bảng xác nhận
    document.getElementById('del-nl-id').innerText = item.id;
    document.getElementById('del-nl-name').innerText = item.name;
}

// Hàm Xóa chính thức
async function submitDeleteNl() {

    try {
        const response = await fetch(`http://localhost:8080/api/nguyenlieu/${currentDeleteNlId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Lỗi khi xóa nguyên liệu: ${response.status}`);
        }
    }
    catch (error) {
        console.error("Lỗi khi gọi API DELETE:", error);
        alert("Lỗi kết nối Backend khi xóa nguyên liệu!");
        return;
    }

    // Lọc bỏ nguyên liệu khỏi mảng
    ingredientsDB = ingredientsDB.filter(i => i.id !== currentDeleteNlId);
    
    closeAllModals();
    renderIngredients(); // Vẽ lại giao diện danh sách
}