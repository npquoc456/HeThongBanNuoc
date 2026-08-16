function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 1080);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

let productsDB = [];
let cart = [];
let currentCategory = 'all'; 
let totalCartPrice = 0; 
let currentPayingBillId = null; // Biến siêu quan trọng để biết đang thanh toán bill MỚI hay CŨ

/* ================== LOAD SẢN PHẨM ================== */
async function loadproductfromapi() {
    try {
        const response = await fetch('http://localhost:8080/api/sanpham')
        if(!response.ok) throw new Error("Lỗi máy chủ");
        const data = await response.json();
        productsDB = data.map(sp => ({
            id: sp.id.toString(),
            name: sp.tenSP,
            price: sp.giaSP,
            category: sp.loaiSP || 'all', 
            image: sp.hinhAnh || 'ICONS/Logoicon.png'
        }));
        filterProducts('all');
    } catch (error) {
        console.error(error);
    }
} 

function filterProducts(category) {
    currentCategory = category;
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    const kw = (document.getElementById('search-input')?.value || '').trim().toLowerCase();
    grid.innerHTML = '';
    
    productsDB.filter(p => (currentCategory === 'all' || p.category === currentCategory) && 
                           (p.name.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw)))
        .forEach(p => {
            grid.innerHTML += `
                <div class="product-card">
                    <h4>${p.name}</h4>
                    <img src="${p.image}" class="product-image" style="width: 80%; height: 100px; object-fit: cover; border-radius: 8px;">
                    <img src="ICONS/Addicon.png" class="btn-add" onclick="addToCart('${p.id}')">
                </div>
            `;
        });
}
loadproductfromapi();

/* ================== GIỎ HÀNG ================== */
function addToCart(productId) {
    const product = productsDB.find(p => p.id === productId); 
    const item = cart.find(i => i.id === productId); 
    if (item) item.qty += 1;
    else cart.push({ ...product, qty: 1 });
    renderCart();
}

function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId); 
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== productId); 
        renderCart();
    }
}

function setQty(productId, newValue) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty = Math.max(1, parseInt(newValue) || 1);
        renderCart();
    }
}

function renderCart() {
    const list = document.getElementById('cart-list'); 
    if (!list) return;
    list.innerHTML = '';
    totalCartPrice = 0;

    if(cart.length === 0) list.innerHTML = "Đơn hàng trống";

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        totalCartPrice += itemTotal; 
        list.innerHTML += `
            <div class="cart-item">
                <span>${item.id}</span>
                <span>${item.name}</span>
                <span>${formatMoney(item.price)}</span>
                <div class="qty-control">
                    <button onclick="updateQty('${item.id}', -1)">-</button> 
                    <input type="number" value="${item.qty}" min="1" onchange="setQty('${item.id}', this.value)">
                    <button onclick="updateQty('${item.id}', 1)">+</button> 
                </div>
                <span>${formatMoney(itemTotal)}</span>
            </div>
        `;
    });

    document.getElementById('total-price').innerText = formatMoney(totalCartPrice);
    document.getElementById('final-price').innerText = formatMoney(totalCartPrice);
}

function clearCart() { cart = []; renderCart(); }

function updateCurrentTime() {
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('current-time').textContent = now.toLocaleTimeString('vi-VN');
}
setInterval(updateCurrentTime, 1000);
updateCurrentTime(); 

/* ================== MODAL TÍCH ĐIỂM & TẠO HÓA ĐƠN ================== */
let customersArray = [];
let currentCustomerName = "null"; 
let foundCustomerTemp = null; 

async function loadCustomersFromAPI() {
    try {
        const res = await fetch('http://localhost:8080/api/tktrungthanh');
        const data = await res.json();
        customersArray = data.map(c => ({ id: c.id.toString(), name: c.tenKH, date: c.ngayTao, points: c.soLuongMua }));
    } catch (e) {}
}
loadCustomersFromAPI();

function openTichDiemModal() {
    if (cart.length === 0) { alert("Giỏ hàng trống!"); return; }
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-tichdiem').style.display = 'flex';
    document.getElementById('sdt-tichdiem-input').value = '';
    document.getElementById('info-customer-box').style.display = 'none';
    document.getElementById('btn-action-tichdiem').textContent = 'TẠO';
}

function handlePhoneInput() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    document.getElementById('info-customer-box').style.display = 'none'; 
    document.getElementById('btn-action-tichdiem').textContent = val === '' ? 'TẠO' : 'TÌM';
}

function actionTaoTkOrTim() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    if (val === '') {
        document.getElementById('modal-tichdiem').style.display = 'none';
        document.getElementById('modal-taotk').style.display = 'block';
    } else {
        foundCustomerTemp = customersArray.find(c => c.id === val);
        if (foundCustomerTemp) {
            document.getElementById('info-customer-box').style.display = 'flex';
            document.getElementById('info-sdt').innerText = foundCustomerTemp.id;
            document.getElementById('info-ten').innerText = foundCustomerTemp.name;
            document.getElementById('info-diem').innerText = foundCustomerTemp.points;
        } else alert("Không tìm thấy khách hàng!");
    }
}

function submitTaoTaiKhoan() {
    // Logic lưu khách hàng...
    alert("Tạo tài khoản thành công!");
    currentCustomerName = document.getElementById('new-ten').value; 
    openHoaDonModal(null); 
}

function confirmTichDiem() { currentCustomerName = foundCustomerTemp.name; openHoaDonModal(null); }
function skipTichDiem() { currentCustomerName = "Khách lẻ"; foundCustomerTemp = null; openHoaDonModal(null); }

/* MỞ FORM THANH TOÁN: Dùng chung cho Tạo Mới hoặc Thanh Toán Lại */
function openHoaDonModal(billIdToPay) {
    closeAllModals();
    currentPayingBillId = billIdToPay; 
    
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-hoadon').style.display = 'flex';

    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';

    if (!billIdToPay) {
        // TRƯỜNG HỢP 1: ĐANG TẠO HÓA ĐƠN MỚI TỪ GIỎ HÀNG
        document.getElementById('receipt-id').innerText = "Tạo mới...";
        document.getElementById('receipt-customer').innerText = currentCustomerName;
        
        // --- THÊM DÒNG NÀY ĐỂ HIỆN NGÀY GIỜ HIỆN TẠI ---
        document.getElementById('receipt-date').innerText = getFormattedDateTime();

        cart.forEach(item => {
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });
        document.getElementById('receipt-total').innerText = formatMoney(totalCartPrice);
        document.getElementById('receipt-final').innerText = formatMoney(totalCartPrice);
    } else {
        // TRƯỜNG HỢP 2: ĐANG THANH TOÁN HÓA ĐƠN CŨ TỪ DANH SÁCH
        const bill = mockBillsArray.find(b => b.id === billIdToPay);
        document.getElementById('receipt-id').innerText = bill.id;
        document.getElementById('receipt-customer').innerText = bill.customer;
        document.getElementById('receipt-date').innerText = bill.date;
        bill.items.forEach(item => {
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });
        document.getElementById('receipt-total').innerText = formatMoney(bill.total);
        document.getElementById('receipt-final').innerText = formatMoney(bill.total);
    }
}

/* ================== DANH SÁCH & CHI TIẾT HÓA ĐƠN ================== */
let mockBillsArray = [];

async function loadhoadfromapi() {
    try {
        const response = await fetch('http://localhost:8080/api/hoadon');
        if (!response.ok) throw new Error("Lỗi máy chủ " + response.status);
        const data = await response.json();

        mockBillsArray = data.map(bill => {
            const cthdList = bill.cthds || bill.CTHDs || bill.cthdList || [];
            return {
                id: bill.id ? String(bill.id) : 'N/A',
                staff: bill.tenNhanVien || 'Nhân viên',
                customer: bill.tenKhachHang || 'Khách lẻ',
                date: bill.ngayTao || 'Không rõ',
                total: bill.tongTien || 0,
                status: mapStatus(bill.trangThai),
                method: bill.phuongThucThanhToan || 'TIEN_MAT',
                items: cthdList.map(item => ({
                    id: item.sanPhamId || item.sanPham?.id || 'N/A',
                    name: item.tenSanPham || item.sanPham?.tenSP || 'Sản phẩm',
                    price: item.donGia || item.sanPham?.giaSP || 0,
                    qty: item.soLuong || 0
                })) 
            }
        });

        if (document.getElementById('modal-bill-list')?.style.display === "block") {
            renderBillList();
        }
    } catch (error) { console.error(error); }
}
loadhoadfromapi();

function openBillListModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-bill-list').style.display = 'block';
    renderBillList();
}

function renderBillList() {
    const tbody = document.getElementById('bill-list-body');
    if (!tbody) return;
    const keyword = (document.getElementById('bill-search-input')?.value || '').trim().toLowerCase();
    tbody.innerHTML = '';

    // 1. Lọc hóa đơn theo ô tìm kiếm
    let filteredBills = mockBillsArray.filter(b => b.id.toLowerCase().includes(keyword));

    // 2. TÍNH NĂNG MỚI: Sắp xếp hóa đơn từ lớn nhất tới nhỏ nhất (ID giảm dần)
    filteredBills.sort((a, b) => parseInt(b.id) - parseInt(a.id));

    if (filteredBills.length === 0) {
        tbody.innerHTML = '<div style="text-align:center; padding: 20px;">Không có hóa đơn.</div>';
        return;
    }

    const editIconSvg = `<svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; width:20px; height:20px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

    filteredBills.forEach(bill => {
        let color = '#0000CC'; // Chờ xác nhận
        if (bill.status === 'Đã xác nhận' || bill.status === 'Đã thanh toán') color = '#008A5A';
        else if (bill.status === 'Đã hủy') color = '#CC0000';

        tbody.innerHTML += `
            <div class="bill-row-grid bill-data-row">
                <span>${bill.id}</span>
                <span>${bill.staff}</span> 
                <span>${bill.date}</span>
                <span>${formatMoney(bill.total)}</span>
                <span style="color: ${color}; font-weight: bold;">${bill.status}</span>
                <span style="text-align: right; padding-right: 15px;" onclick="showBillDetail('${bill.id}')">${editIconSvg}</span>
            </div>
        `;
    });
}

function showBillDetail(billId) {
    const bill = mockBillsArray.find(b => b.id === billId);
    if(!bill) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-bill-detail').style.display = 'flex';

    document.getElementById('detail-id').innerText = bill.id;
    document.getElementById('detail-date').innerText = bill.date;
    document.getElementById('detail-customer').innerText = bill.customer;
    document.getElementById('detail-total').innerText = formatMoney(bill.total);

    const tbody = document.getElementById('detail-body');
    if (tbody) {
        tbody.innerHTML = '';
        bill.items.forEach(item => {
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });
    }

    const statusBtn = document.getElementById('detail-status-btn');
    
    // Ẩn nút hủy riêng lẻ bên dưới nếu có
    let cancelBtn = document.getElementById('detail-cancel-btn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    if (statusBtn) {
        if (bill.status === 'Đã thanh toán' || bill.status === 'Đã xác nhận') {
            statusBtn.className = 'btn-status btn-status-paid';
            statusBtn.textContent = bill.status.toUpperCase();
            statusBtn.onclick = function() { alert('Hóa đơn này đã hoàn tất!'); };
        } 
        else {
            // CẢ ĐƠN "CHỜ XÁC NHẬN" VÀ "ĐÃ HỦY" ĐỀU CÓ THỂ BẤM ĐỂ THANH TOÁN LẠI
            statusBtn.className = 'btn-status ' + (bill.status === 'Đã hủy' ? 'btn-status-cancelled' : 'btn-status-pending');
            statusBtn.textContent = bill.status === 'Đã hủy' ? 'THANH TOÁN LẠI' : 'THANH TOÁN NGAY';
            statusBtn.onclick = function() { 
                // Mở lại form phương thức thanh toán cho hóa đơn này
                openHoaDonModal(billId); 
            };
        }
    }
}

// Hàm dùng cho nút "Hủy đơn" bên trong form Phương thức thanh toán (Modal 3)


function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
    
    // RẤT QUAN TRỌNG: Giải phóng bộ nhớ hóa đơn cũ để không bị kẹt khi hủy đơn mới
    currentPayingBillId = null; 
}

// ========================================================
// HÀM MỚI: TỰ ĐỘNG HỦY ĐƠN NẾU ĐÓNG FORM THANH TOÁN GIỮA CHỪNG
// ========================================================
async function forceCancelWhenClosing() {
    const modalHoaDon = document.getElementById('modal-hoadon');
    if (modalHoaDon && modalHoaDon.style.display === 'flex') {
        if (confirm("Bạn đang tắt form thanh toán. Bạn có muốn lưu HỦY đơn hàng này vào hệ thống luôn không?")) {
            await cancelCurrentBillAction(true); // Gửi cờ true để bỏ qua bước hỏi xác nhận lần 2
            return; 
        }
    }
    closeAllModals();
}
// Xử lý nút HỦY (Chống lỗi click nhầm vào ảnh/icon con bên trong)
window.cancelCurrentBillAction = async function() {
    // 1. Nếu đang thao tác trên hóa đơn cũ có sẵn trong danh sách
    if (currentPayingBillId) {
        const bill = mockBillsArray.find(b => b.id === currentPayingBillId);
        const method = bill?.method === 'Tiền mặt' ? 'TIEN_MAT' : 'CHUYEN_KHOAN';
        closeAllModals();
        await updateBillStatusOnBackend(currentPayingBillId, 'DA_HUY', method);
        return;
    }

    // 2. Lấy dữ liệu giỏ hàng trước khi xóa
    const itemsToSave = [...cart];
    const totalToSave = totalCartPrice;

    // 3. THỰC HIỆN NGAY LẬP TỨC: Tự tắt bảng + Dọn sạch giỏ hàng trên giao diện
    closeAllModals();
    clearCart();

    if (itemsToSave.length === 0) return;

    // 4. Gửi dữ liệu ngầm xuống Spring Boot để lưu vào CSDL với trạng thái ĐÃ HỦY
    const cthdsPayload = itemsToSave.map(item => ({ 
        sanPhamId: parseInt(item.id), 
        soLuong: item.qty, 
        donGia: item.price 
    }));

    const khachId = (foundCustomerTemp && foundCustomerTemp.id) ? parseInt(foundCustomerTemp.id) : null;

    const hoaDonDTO = {
        nhanVienId: 1,
        tkTrungThanhId: khachId,
        tongTien: totalToSave,
        trangThai: 'DA_HUY',
        phuongThucThanhToan: 'TIEN_MAT',
        ngayTao: getFormattedDateTime(),
        CTHDs: cthdsPayload,
        cthds: cthdsPayload
    };

    try {
        let response = await fetch('http://localhost:8080/api/hoadon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hoaDonDTO)
        });

        // Phòng hờ Backend cấu hình Enum tên là 'HUY' thay vì 'DA_HUY'
        if (response.status === 400) {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch('http://localhost:8080/api/hoadon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }

        if (response.ok) {
            await loadhoadfromapi(); // Cập nhật lại danh sách hóa đơn ngầm
        }
    } catch (error) {
        console.error("Lỗi khi lưu hóa đơn hủy:", error);
    }
};

// Bắt sự kiện khi click ra vùng xám bên ngoài
function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        forceCancelWhenClosing(); // Đổi hàm đóng thành hàm kiểm tra Hủy
    }
}
/* ================== GỌI API THANH TOÁN (CREATE & UPDATE) ================== */
function getFormattedDateTime() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

// Hàm này gắn trực tiếp vào các nút "Ngân hàng", "Tiền mặt" trên Modal HTML
async function processPayment(phuongThuc) {
    if (currentPayingBillId) {
        // ĐANG TRẢ CHO HÓA ĐƠN CŨ -> Gọi API Update (PUT)
        await updateBillStatusOnBackend(currentPayingBillId, 'DA_XAC_NHAN', phuongThuc);
    } else {
        // ĐANG MUA TỪ GIỎ HÀNG MỚI -> Gọi API Create (POST)
        await createNewBillOnBackend('DA_XAC_NHAN', phuongThuc);
    }
}

async function createNewBillOnBackend(trangThai, phuongThuc) {
    const cthdsPayload = cart.map(item => ({ sanPhamId: parseInt(item.id), soLuong: item.qty, donGia: item.price }));
    const khachId = (foundCustomerTemp && foundCustomerTemp.id) ? foundCustomerTemp.id : null;

    const hoaDonDTO = {
        nhanVienId: 1, // ID NV Bắt Buộc Phải Có Trong Bảng nhanvien
        tkTrungThanhId: khachId, 
        tongTien: totalCartPrice,
        trangThai: trangThai, 
        phuongThucThanhToan: phuongThuc, 
        ngayTao: getFormattedDateTime(),
        CTHDs: cthdsPayload // Chữ hoa như bạn yêu cầu
    };

    try {
        const response = await fetch('http://localhost:8080/api/hoadon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hoaDonDTO)
        });
        if (!response.ok) throw new Error("Lỗi: " + response.status);

        alert("Tạo hóa đơn thành công!");
        clearCart(); 
        closeAllModals(); 
        await loadhoadfromapi(); 
    } catch (e) {
        console.error(e);
        alert("Lỗi lưu hóa đơn vào CSDL!");
    }
}

async function updateBillStatusOnBackend(billId, newStatus, phuongThuc) {
    const bill = mockBillsArray.find(b => b.id === billId);
    if (!bill) return;

    const hoaDonDTO = {
        id: parseInt(bill.id),
        ngayTao: bill.date, 
        tongTien: bill.total,
        trangThai: newStatus, 
        phuongThucThanhToan: phuongThuc
    };

    try {
        let response = await fetch(`http://localhost:8080/api/hoadon/${billId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hoaDonDTO)
        });
        
        // CHỐNG LỖI BACKEND
        if (response.status === 400 && newStatus === 'DA_HUY') {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch(`http://localhost:8080/api/hoadon/${billId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }

        if (!response.ok) throw new Error("Lỗi máy chủ");

        // SAU KHI THANH TOÁN THÀNH CÔNG:
        alert("Thanh toán thành công!"); 
        closeAllModals(); // Tự động đóng toàn bộ modal để về lại trang giao diện giỏ hàng chính
        await loadhoadfromapi(); // Cập nhật lại danh sách hóa đơn ngầm
        
    } catch (e) {
        console.error(e);
        alert("Lỗi cập nhật trạng thái thanh toán!");
    }
}
/* ================== UTILS ================== */
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + " ₫";
}
function mapStatus(status) {
    switch(status) {
        case 'DA_THANH_TOAN': return 'Đã thanh toán';
        case 'DA_XAC_NHAN': return 'Đã xác nhận'; 
        case 'DA_HUY': return 'Đã hủy';
        case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
        default: return status || 'Chờ xác nhận';
    }
}
// Hàm API an toàn chuyên dùng để lưu Hóa Đơn Hủy
async function createCancelledBillOnBackend(cartData, total) {
    const cthdsPayload = cartData.map(item => ({ sanPhamId: parseInt(item.id), soLuong: item.qty, donGia: item.price }));
    const khachId = (foundCustomerTemp && foundCustomerTemp.id) ? foundCustomerTemp.id : null;

    const hoaDonDTO = {
        nhanVienId: 1,
        tkTrungThanhId: khachId,
        tongTien: total,
        trangThai: 'DA_HUY',
        phuongThucThanhToan: 'TIEN_MAT',
        ngayTao: getFormattedDateTime(),
        CTHDs: cthdsPayload,
        cthds: cthdsPayload
    };

    try {
        let response = await fetch('http://localhost:8080/api/hoadon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hoaDonDTO)
        });
        
        // CHỐNG LỖI BACKEND: Thử lại với chữ 'HUY' nếu Java báo lỗi 400
        if (response.status === 400) {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch('http://localhost:8080/api/hoadon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }
        
        if (!response.ok) throw new Error("Lỗi máy chủ");
        
        // Thành công -> Reload lại danh sách hóa đơn
        alert("Đã lưu lịch sử hủy đơn hàng!");
        await loadhoadfromapi(); 
    } catch (e) {
        console.error(e);
        alert("Đã dọn dẹp giỏ hàng, nhưng chưa lưu được dữ liệu hủy vào máy chủ!");
    }
}

function chuyentrang(trang) {
     window.javaBackend.loadTrang(trang);
}