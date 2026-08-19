/* ==========================================================================
   BIẾN TOÀN CỤC (GLOBAL VARIABLES)
   ========================================================================== */
let productsDB = [];
let cart = [];
let currentCategory = 'all'; 
let totalCartPrice = 0; 
let finalCartPrice = 0; // Lưu giá cuối cùng sau khi giảm 30%
let currentPayingBillId = null; // Biến xác định đang thanh toán bill MỚI hay CŨ
let customersDB = [];
let customersArray = [];
let currentCustomerName = "null"; 
let foundCustomerTemp = null; 
let mockBillsArray = [];



/* ==========================================================================
   NHÓM 1: CẤU HÌNH GIAO DIỆN, THỜI GIAN & TIỆN ÍCH CHUNG (UTILS)
   ========================================================================== */

/**
 * Tự động scale (phóng to/thu nhỏ) giao diện ứng dụng theo kích thước màn hình chuẩn 1440x1080.
 */
function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 1080);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

/**
 * Cập nhật thời gian và ngày tháng thực tế liên tục trên giao diện topbar.
 */
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

/**
 * Lấy định dạng ngày giờ hiện tại dạng chuỗi 'YYYY-MM-DD HH:mm:ss' gửi lên backend.
 */
function getFormattedDateTime() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
}

/**
 * Định dạng số tiền thành chuỗi tiền tệ Việt Nam (VNĐ).
 */
function formatMoney(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + " ₫";
}

/**
 * Chuyển đổi mã trạng thái tiếng Anh từ CSDL sang tiếng Việt hiển thị trên giao diện.
 */
function mapStatus(status) {
    switch(status) {
        case 'DA_THANH_TOAN': return 'Đã thanh toán';
        case 'DA_XAC_NHAN': return 'Đã xác nhận'; 
        case 'DA_HUY': return 'Đã hủy';
        case 'CHO_XAC_NHAN': return 'Chờ xác nhận';
        default: return status || 'Chờ xác nhận';
    }
}

/**
 * Giao tiếp với ứng dụng Java bên ngoài để chuyển trang.
 */
function chuyentrang(trang) {
     window.javaBackend.loadTrang(trang);
}


/* ==========================================================================
   NHÓM 2: QUẢN LÝ SẢN PHẨM & LỌC DANH MỤC
   ========================================================================== */

/**
 * Tải danh sách sản phẩm từ API Backend Spring Boot.
 */
async function loadproductfromapi() {
    try {
        const response = await fetch('http://localhost:8080/api/sanpham');
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
loadproductfromapi();

/**
 * Lọc sản phẩm theo danh mục được chọn.
 */
function filterProducts(category) {
    currentCategory = category;
    renderProducts();
}

/**
 * Hiển thị danh sách sản phẩm ra màn hình giao diện (kèm tìm kiếm).
 */
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


/* ==========================================================================
   NHÓM 3: QUẢN LÝ GIỎ HÀNG (SHOPPING CART)
   ========================================================================== */

/**
 * Thêm sản phẩm vào giỏ hàng hoặc tăng số lượng nếu đã tồn tại.
 */
function addToCart(productId) {
    const product = productsDB.find(p => p.id === productId); 
    const item = cart.find(i => i.id === productId); 
    if (item) item.qty += 1;
    else cart.push({ ...product, qty: 1 });
    renderCart();
}

/**
 * Tăng hoặc giảm số lượng sản phẩm trong giỏ hàng.
 */
function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId); 
    if (item) {
        item.qty += change;
        if (item.qty <= 0) cart = cart.filter(i => i.id !== productId); 
        renderCart();
    }
}

/**
 * Gán trực tiếp số lượng sản phẩm từ ô nhập liệu input.
 */
function setQty(productId, newValue) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.qty = Math.max(1, parseInt(newValue) || 1);
        renderCart();
    }
}

/**
 * Hiển thị danh sách sản phẩm trong giỏ hàng ra giao diện và tính tổng tiền.
 */
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

/**
 * Xóa sạch toàn bộ giỏ hàng hiện tại.
 */
function clearCart() { 
    cart = []; 
    renderCart(); 
}


/* ==========================================================================
   NHÓM 4: QUẢN LÝ KHÁCH HÀNG, TÍCH ĐIỂM & TẠO TÀI KHOẢN
   ========================================================================== */

/**
 * Tải danh sách tài khoản tích điểm từ API.
 */
async function loadCustomersFromAPI() {
    try {
        const res = await fetch('http://localhost:8080/api/tktrungthanh');
        const data = await res.json();
        customersArray = data.map(c => ({ id: c.id.toString(), name: c.tenKH, date: c.ngayTao, points: c.soLuongMua }));
        customersDB = customersArray; // Đồng bộ dữ liệu
    } catch (e) {}
}
loadCustomersFromAPI();

/**
 * Mở modal nhập/kiểm tra số điện thoại tích điểm.
 */
function openTichDiemModal() {
    if (cart.length === 0) { alert("Giỏ hàng trống!"); return; }
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-tichdiem').style.display = 'flex';
    document.getElementById('sdt-tichdiem-input').value = '';
    document.getElementById('info-customer-box').style.display = 'none';
    document.getElementById('btn-action-tichdiem').textContent = 'TẠO';
}

/**
 * Xử lý sự kiện khi gõ số điện thoại vào ô tích điểm.
 */
function handlePhoneInput() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    document.getElementById('info-customer-box').style.display = 'none'; 
    document.getElementById('btn-action-tichdiem').textContent = val === '' ? 'TẠO' : 'TÌM';
}

/**
 * Quyết định chuyển sang tạo tài khoản mới hoặc tìm kiếm thông tin khách hàng.
 */
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

/**
 * Gửi yêu cầu tạo tài khoản tích điểm mới lên server hoặc tự động nhận diện nếu đã tồn tại.
 */
async function submitTaoTaiKhoan() {
    const sdt = document.getElementById('new-sdt').value.trim();
    const tenKH = document.getElementById('new-ten').value.trim();

    if(!sdt || !tenKH){
        alert("Vui lòng nhập đầy đủ số điện thoại và họ tên!");
        return;
    }

    let existingKH = customersDB.find(c => c.id === sdt);

    if(existingKH){
        alert("Số điện thoại này đã tồn tại trong hệ thống. Đã tự động chọn tài khoản!");
        currentCustomerName = existingKH.name;
        foundCustomerTemp = existingKH;

        document.getElementById('modal-taotk').style.display = 'none';
        if(typeof closeAllModals === 'function') closeAllModals();

        openHoaDonModal(null); 
        return;
    }

    const TKTrungThanhDTO = {
        id: sdt, 
        tenKH: tenKH, 
        soLuongMua: 0, 
        ngayTao: new Date().toISOString().split('T')[0]
    };

    try {
        let response = await fetch('http://localhost:8080/api/tktrungthanh', {
            method: 'POST', 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(TKTrungThanhDTO)
        });

        if(response.ok){
            alert("Tạo tài khoản thành công!");
            currentCustomerName = tenKH;

            await loadCustomersFromAPI();

            // Mặc định cho điểm bằng 0 khi vừa tạo
            foundCustomerTemp = customersDB.find(c => c.id === sdt) || { id: sdt, name: tenKH, points: 0 };

            document.getElementById('modal-taotk').style.display = 'none';
            if(typeof closeAllModals === 'function') closeAllModals();

            openHoaDonModal(null); 
        }
        else {
            alert("Lỗi: Không thể tạo tài khoản (Có thể SĐT này đã tồn tại).");
        }

    } catch (error){
        console.error("Lỗi khi lưu tk tích điểm: ", error);
    }
}

/**
 * Xác nhận chọn khách hàng đã tìm thấy để tiếp tục thanh toán.
 */
function confirmTichDiem() { 
    currentCustomerName = foundCustomerTemp.name; 
    openHoaDonModal(null); 
}

/**
 * Bỏ qua bước tích điểm (chọn khách lẻ) để thanh toán.
 */
function skipTichDiem() { 
    currentCustomerName = "Khách lẻ"; 
    foundCustomerTemp = null; 
    openHoaDonModal(null); 
}


/* ==========================================================================
   NHÓM 5: QUẢN LÝ HÓA ĐƠN, THANH TOÁN & GIAO TIẾP API HÓA ĐƠN
   ========================================================================== */

/**
 * Tải danh sách hóa đơn từ API Backend.
 */
async function loadhoadfromapi() {
    try {
        if (customersArray.length === 0) {
            await loadCustomersFromAPI();
        }

        const response = await fetch('http://localhost:8080/api/hoadon');
        if (!response.ok) throw new Error("Lỗi máy chủ " + response.status);
        const data = await response.json();

        mockBillsArray = data.map(bill => {
            const cthdList = bill.cthds || bill.CTHDs || bill.cthdList || [];
            let tenKhach = 'Khách lẻ';

            // Lấy mã ID khách hàng mà Backend trả về
            let rawKhachId = bill.tkTrungThanhId || bill.khachHangId || (bill.tkTrungThanh ? bill.tkTrungThanh.id : null);

            // Bước 1: Thử lấy tên trả về sẵn
            if (bill.tenKhachHang) tenKhach = bill.tenKhachHang;
            else if (bill.tkTrungThanh && bill.tkTrungThanh.tenKH) tenKhach = bill.tkTrungThanh.tenKH;
            else if (bill.tenKH) tenKhach = bill.tenKH;
            
            // Bước 2: Tự đối chiếu ID thông minh (Dùng dấu == để ép kiểu tự động)
            if (tenKhach === 'Khách lẻ' && rawKhachId) {
                const foundC = customersArray.find(c => c.id == rawKhachId);
                if (foundC) {
                    tenKhach = foundC.name;
                }
            }

            // Bước 3: Fallback lấy từ localStorage cho các đơn vừa tạo
            if (tenKhach === 'Khách lẻ') {
                const savedName = localStorage.getItem('bill_cus_' + bill.id);
                if (savedName) tenKhach = savedName;
            }

            return {
                id: bill.id ? String(bill.id) : 'N/A',
                staff: bill.tenNhanVien || 'Nhân viên',
                customer: tenKhach,
                rawTkId: rawKhachId, 
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

        // Sắp xếp mới nhất lên đầu
        mockBillsArray.sort((a, b) => parseInt(b.id) - parseInt(a.id));

        if (document.getElementById('modal-bill-list')?.style.display === "block") {
            renderBillList();
        }
    } catch (error) { console.error("Lỗi load hóa đơn:", error); }
}
loadhoadfromapi();

/**
 * Mở modal form phương thức thanh toán (dùng chung cho tạo mới hoặc thanh toán lại hóa đơn cũ).
 */
function openHoaDonModal(billIdToPay) {
    closeAllModals();
    currentPayingBillId = billIdToPay; 
    
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-hoadon').style.display = 'flex';

    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';

    if (!billIdToPay) {
        // TẠO HÓA ĐƠN MỚI
        document.getElementById('receipt-id').innerText = "Tạo mới...";
        document.getElementById('receipt-customer').innerText = currentCustomerName;
        document.getElementById('receipt-date').innerText = getFormattedDateTime();

        let soluongsanphammua = 0;
        cart.forEach(item =>{
            soluongsanphammua += item.qty;
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });

        // TÍNH ĐIỂM + GIẢM GIÁ (Bao quát cả Khách lẻ và Có tài khoản)
        let giamgia = 0;
        let diemtruoc = 0; // Mặc định điểm trước đó = 0 (dành cho Khách lẻ)

        if(foundCustomerTemp && foundCustomerTemp.id){
            diemtruoc = parseInt(foundCustomerTemp.points) || 0; 
        }

        // Xét chung: Nếu (Điểm cũ + Số mua lần này) >= 10 thì giảm 30%
        if(diemtruoc + soluongsanphammua >= 10){
            giamgia = totalCartPrice * 0.3; 
        }

        finalCartPrice = totalCartPrice - giamgia; 

        document.getElementById('receipt-total').innerText = formatMoney(totalCartPrice); 
        
        const discountEl = document.getElementById('receipt-discount');
        if (discountEl) discountEl.innerText = formatMoney(giamgia);

        document.getElementById('receipt-final').innerText = formatMoney(finalCartPrice); 

    } else {
        // THANH TOÁN LẠI HÓA ĐƠN CŨ
        const bill = mockBillsArray.find(b => b.id === billIdToPay);
        document.getElementById('receipt-id').innerText = bill.id;
        document.getElementById('receipt-customer').innerText = bill.customer;
        document.getElementById('receipt-date').innerText = bill.date;

        bill.items.forEach(item => {
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });
        
        document.getElementById('receipt-total').innerText = formatMoney(bill.total);
        
        const discountEl = document.getElementById('receipt-discount');
        if (discountEl) discountEl.innerText = formatMoney(0); 

        document.getElementById('receipt-final').innerText = formatMoney(bill.total);
    }
}

/**
 * Mở modal danh sách tổng hợp các hóa đơn.
 */
function openBillListModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-bill-list').style.display = 'block';
    renderBillList();
}

/**
 * Render danh sách hóa đơn ra màn hình (hỗ trợ lọc từ khóa và sắp xếp ID giảm dần).
 */
function renderBillList() {
    const tbody = document.getElementById('bill-list-body');
    if (!tbody) return;
    const keyword = (document.getElementById('bill-search-input')?.value || '').trim().toLowerCase();
    tbody.innerHTML = '';

    let filteredBills = mockBillsArray.filter(b => b.id.toLowerCase().includes(keyword));
    filteredBills.sort((a, b) => parseInt(b.id) - parseInt(a.id)); 

    if (filteredBills.length === 0) {
        tbody.innerHTML = '<div style="text-align:center; padding: 20px;">Không có hóa đơn.</div>';
        return;
    }

    const editIconSvg = `<svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor:pointer; width:20px; height:20px;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

    filteredBills.forEach(bill => {
        let color = '#0000CC'; 
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

/**
 * Hiển thị chi tiết một hóa đơn khi bấm vào icon chỉnh sửa.
 */
function showBillDetail(billId) {
    const bill = mockBillsArray.find(b => b.id === billId);
    if(!bill) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-bill-detail').style.display = 'flex';

    // Quét lại lần cuối ngay khi bấm vào icon chỉnh sửa
    let finalCustomerName = bill.customer;
    if (finalCustomerName === 'Khách lẻ' && bill.rawTkId) {
        let found = customersArray.find(c => c.id == bill.rawTkId);
        if(found) finalCustomerName = found.name;
    }

    document.getElementById('detail-id').innerText = bill.id;
    document.getElementById('detail-date').innerText = bill.date;
    document.getElementById('detail-customer').innerText = finalCustomerName; 
    document.getElementById('detail-total').innerText = formatMoney(bill.total);

    const tbody = document.getElementById('detail-body');
    if (tbody) {
        tbody.innerHTML = '';
        bill.items.forEach(item => {
            tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
        });
    }

    const statusBtn = document.getElementById('detail-status-btn');
    let cancelBtn = document.getElementById('detail-cancel-btn');
    if (cancelBtn) cancelBtn.style.display = 'none';

    if (statusBtn) {
        if (bill.status === 'Đã thanh toán' || bill.status === 'Đã xác nhận') {
            statusBtn.className = 'btn-status btn-status-paid';
            statusBtn.textContent = bill.status.toUpperCase();
            statusBtn.onclick = function() { alert('Hóa đơn này đã hoàn tất!'); };
        } 
        else {
            statusBtn.className = 'btn-status ' + (bill.status === 'Đã hủy' ? 'btn-status-cancelled' : 'btn-status-pending');
            statusBtn.textContent = bill.status === 'Đã hủy' ? 'THANH TOÁN LẠI' : 'THANH TOÁN NGAY';
            statusBtn.onclick = function() { 
                openHoaDonModal(billId); 
            };
        }
    }
}

/**
 * Điều phối xử lý thanh toán (Tiền mặt / Chuyển khoản) cho đơn mới hoặc đơn cũ.
 */
async function processPayment(phuongThuc) {
    if (currentPayingBillId) {
        await updateBillStatusOnBackend(currentPayingBillId, 'DA_XAC_NHAN', phuongThuc);
    } else {
        await createNewBillOnBackend('DA_XAC_NHAN', phuongThuc);
    }
}

/**
 * Gửi yêu cầu POST tạo mới hóa đơn lên Backend.
 */
async function createNewBillOnBackend(trangThai, phuongThuc) {
    const cthdsPayload = cart.map(item => ({ 
        sanPhamId: parseInt(item.id), soLuong: item.qty, donGia: item.price }));
    
    const khachId = (foundCustomerTemp && foundCustomerTemp.id) ? parseInt(foundCustomerTemp.id) : null;
    const customerName = (foundCustomerTemp && foundCustomerTemp.name) ? foundCustomerTemp.name : (currentCustomerName !== 'null' && currentCustomerName !== 'Khách lẻ' ? currentCustomerName : null);

    const hoaDonDTO = {
        nhanVienId: 1, 
        tkTrungThanhId: khachId, 
        tongTien: finalCartPrice, 
        trangThai: trangThai, 
        phuongThucThanhToan: phuongThuc, 
        ngayTao: getFormattedDateTime(),
        CTHDs: cthdsPayload 
    };

    try {
        const response = await fetch('http://localhost:8080/api/hoadon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(hoaDonDTO)
        });
        if (!response.ok) throw new Error("Lỗi: " + response.status);

        if(khachId){
            let soluongsanphammua = cart.reduce((sum,item) => sum + item.qty, 0);
            let sodiemtruoc = parseInt(foundCustomerTemp.points) || 0;
            let diemmoi = sodiemtruoc + soluongsanphammua;

            // Đã sửa: Chỉ trừ 10 điểm nếu đạt mốc >= 10
            if (diemmoi >= 10){
                diemmoi = diemmoi - 10;
            }
            await capnhatdiemkhachhang(khachId, diemmoi, foundCustomerTemp);
        }
        
        alert("Tạo hóa đơn thành công!"); 
        await loadhoadfromapi(); 

        // Ghi đè tên khách vào localStorage để xử lý lỗi Backend thiếu data
        if (mockBillsArray.length > 0 && customerName !== 'Khách lẻ') {
            const latestBillId = mockBillsArray[0].id;
            localStorage.setItem('bill_cus_' + latestBillId, customerName);
            mockBillsArray[0].customer = customerName; 
        }

        clearCart(); 
        closeAllModals(); 
        if (document.getElementById('modal-bill-list')?.style.display === "block") {
            renderBillList();
        }
    } catch (e) {
        console.error(e);
        alert("Lỗi lưu hóa đơn vào CSDL!");
    }
}

/**
 * Cập nhật điểm tích lũy của khách hàng xuống Backend
 */
async function capnhatdiemkhachhang(id, diemmoi, khachhang) {
    const dto = {
        id: id, 
        tenKH: khachhang.name, 
        soLuongMua: diemmoi, 
        ngayTao: khachhang.date || new Date().toISOString().split('T')[0]
    };
    try{
        await fetch(`http://localhost:8080/api/tktrungthanh/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dto)
        });
        await loadCustomersFromAPI();
    }
    catch(e){
        console.error("Lỗi cập nhật điểm: ", e);
    }
}

/**
 * Gửi yêu cầu PUT cập nhật trạng thái hóa đơn cũ lên Backend.
 */
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
        
        if (response.status === 400 && newStatus === 'DA_HUY') {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch(`http://localhost:8080/api/hoadon/${billId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }

        if (!response.ok) throw new Error("Lỗi máy chủ");

        alert("Thanh toán thành công!"); 
        closeAllModals(); 
        await loadhoadfromapi(); 
        
    } catch (e) {
        console.error(e);
        alert("Lỗi cập nhật trạng thái thanh toán!");
    }
}

/**
 * Hàm hỗ trợ lưu hóa đơn hủy xuống CSDL.
 */
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
        
        if (response.status === 400) {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch('http://localhost:8080/api/hoadon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }
        
        if (!response.ok) throw new Error("Lỗi máy chủ");
        
        alert("Đã lưu lịch sử hủy đơn hàng!");
        await loadhoadfromapi(); 
    } catch (e) {
        console.error(e);
        alert("Đã dọn dẹp giỏ hàng, nhưng chưa lưu được dữ liệu hủy vào máy chủ!");
    }
}


/* ==========================================================================
   NHÓM 6: QUẢN LÝ MODAL & HỦY ĐƠN HÀNG GIỮA CHỪNG
   ========================================================================== */

/**
 * Đóng toàn bộ các modal đang hiển thị và reset trạng thái thanh toán.
 */
function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
    currentPayingBillId = null; 
}

/**
 * Tự động hỏi và lưu đơn hàng trạng thái HỦY nếu người dùng đóng form thanh toán giữa chừng.
 */
async function forceCancelWhenClosing() {
    const modalHoaDon = document.getElementById('modal-hoadon');
    if (modalHoaDon && modalHoaDon.style.display === 'flex') {
        if (confirm("Bạn đang tắt form thanh toán. Bạn có muốn lưu HỦY đơn hàng này vào hệ thống luôn không?")) {
            await cancelCurrentBillAction(true); 
            return; 
        }
    }
    closeAllModals();
}

/**
 * Xử lý hành động hủy đơn hàng hiện tại và đẩy dữ liệu lên backend.
 */
window.cancelCurrentBillAction = async function() {
    if (currentPayingBillId) {
        const bill = mockBillsArray.find(b => b.id === currentPayingBillId);
        const method = bill?.method === 'Tiền mặt' ? 'TIEN_MAT' : 'CHUYEN_KHOAN';
        closeAllModals();
        await updateBillStatusOnBackend(currentPayingBillId, 'DA_HUY', method);
        return;
    }

    const itemsToSave = [...cart];
    const totalToSave = totalCartPrice;

    closeAllModals();
    clearCart();

    if (itemsToSave.length === 0) return;

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

        if (response.status === 400) {
            hoaDonDTO.trangThai = 'HUY';
            response = await fetch('http://localhost:8080/api/hoadon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(hoaDonDTO)
            });
        }

        if (response.ok) {
            await loadhoadfromapi(); 
        }
    } catch (error) {
        console.error("Lỗi khi lưu hóa đơn hủy:", error);
    }
};

/**
 * Bắt sự kiện khi click ra ngoài vùng modal (vùng xám overlay) để thực hiện hủy/đóng.
 */
function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        forceCancelWhenClosing(); 
    }
}