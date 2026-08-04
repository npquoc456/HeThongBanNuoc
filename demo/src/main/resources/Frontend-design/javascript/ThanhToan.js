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

// Biến lưu trữ sản phẩm và giỏ hàng
let productsDB = [];
let cart = [];
let currentCategory = 'all'; 
let totalCartPrice = 0; // Đã thêm biến này để lưu tổng tiền giỏ hàng dùng cho lúc xuất bill

// Gọi API lấy dữ liệu sản phẩm
async function loadproductfromapi() {
    try{
        const response = await fetch('http://localhost:8080/api/sanpham')

        if(!response.ok){
           throw new Error("Lỗi máy chủ " + response.status)
        }
        const data = await response.json();
        productsDB = data.map( sp => {
            return {
                id: sp.id.toString(),
                name: sp.tenSP,
                price: sp.giaSP,
                category: sp.loaiSP || 'all', 
                image: sp.hinhAnh || 'ICONS/Logoicon.png'
            };
        });
        filterProducts('all')
    }
    catch (error){
        console.error("Không thể tải dữ liệu sản phẩm:", error);
        document.getElementById('product-grid').innerHTML = 
        `<p style="color:red; grid-column: 1/-1; padding-top: 20px;">Lỗi tải dữ liệu. Vui lòng kiểm tra xem Backend (Spring Boot) đã chạy chưa.</p>`;
    }
} 

const formatMoney = (amount) => amount.toLocaleString('vi-VN') + "";

// Lọc sản phẩm
function filterProducts(category) {
    currentCategory = category;
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const searchKeyword = document.getElementById('search-input').value.trim().toLowerCase();
    grid.innerHTML = '';
    
    const filtered = productsDB.filter(p => {
        const matchCategory = currentCategory === 'all' || p.category === currentCategory;
        const matchSearch = p.name.toLowerCase().includes(searchKeyword) || 
                            p.id.toLowerCase().includes(searchKeyword);
        return matchCategory && matchSearch;
    });

    filtered.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <h4>${p.name}</h4>
                <img src="${p.image}" class="product-image" alt="${p.name}" style="width: 80%; height: 100px; object-fit: cover; border-radius: 8px;">
                <img src="ICONS/Addicon.png" class="btn-add" onclick="addToCart('${p.id}')" alt="Thêm">
            </div>
        `;
    });
}
// Khởi chạy lấy sản phẩm
loadproductfromapi();

// Thêm hàng vào giỏ
function addToCart(productId) {
    const product = productsDB.find(p => p.id === productId); 
    const existingItem = cart.find(item => item.id === productId); 

    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    renderCart();
}

// Tăng giảm số lượng
function updateQty(productId, change) {
    const item = cart.find(i => i.id === productId); 
    if (item) {
        item.qty += change;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== productId); 
        }
        renderCart();
    }
}

// Nhập trực tiếp số lượng
function setQty(productId, newValue) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        let qty = parseInt(newValue);
        if (isNaN(qty) || qty <= 0) {
            qty = 1;
        }
        item.qty = qty;
        renderCart();
    }
}

// Vẽ lại giỏ hàng và tính tiền 
function renderCart() {
    const list = document.getElementById('cart-list'); 
    list.innerHTML = '';
    
    // Reset tổng tiền mỗi lần render
    totalCartPrice = 0;

    if(cart.length === 0) {
        list.innerHTML = "Đơn hàng trống";
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        totalCartPrice += itemTotal; // Cộng dồn tiền để lưu trữ

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

// Xóa tất cả giỏ hàng
function clearCart() {
    cart = [];
    renderCart();
}

// Cập nhật thời gian hiện tại
function updateCurrentTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN');
    
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
    
    // Cập nhật luôn thời gian cho màn hình hóa đơn
    const receiptDateEl = document.getElementById('receipt-date');
    if (receiptDateEl) {
        receiptDateEl.textContent = now.toLocaleDateString('vi-VN');
    }
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime(); // Gọi ngay khi tải trang

// Hàm chuyển cảnh của hệ thống
function chuyentrang(trang) {
    if(window.javaBackend){
        window.javaBackend.loadTrang(trang);
    } else {
        console.log("Chuyển hướng đến:", trang);
    }
}

filterProducts('all');


/* =======================================================================
   ================= PHẦN XỬ LÝ LOGIC MODALS THANH TOÁN ==================
   ======================================================================= */

// Mảng Array Fake Khách Hàng (Tạm thời để test, sau này bạn đấu Backend vào đây)
let customersArray = [
    { phone: '08738938287', name: 'Alo vũ à vũ', date: '24/6/2026', points: 9 }
];

let currentCustomerName = "null"; // Biến lưu Tên khách hàng hiện tại
let foundCustomerTemp = null; // Biến tạm lưu Khách Hàng tìm thấy

// 1. Mở màn hình nhập số điện thoại tích điểm
function openTichDiemModal() {
    if (cart.length === 0) { 
        alert("Giỏ hàng đang trống! Vui lòng chọn món trước khi thanh toán."); 
        return; 
    }
    
    // Reset lại giao diện của các form khi mở lên
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-tichdiem').style.display = 'flex';
    document.getElementById('modal-taotk').style.display = 'none';
    document.getElementById('modal-hoadon').style.display = 'none';
    document.getElementById('sdt-tichdiem-input').value = '';
    document.getElementById('info-customer-box').style.display = 'none';
    handlePhoneInput(); 
}

// 2. Lắng nghe ô nhập sđt (Đổi chữ TẠO <-> TÌM)
function handlePhoneInput() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    const btn = document.getElementById('btn-action-tichdiem');
    
    // Ẩn bảng thông tin nếu người dùng thay đổi số đang nhập
    document.getElementById('info-customer-box').style.display = 'none'; 
    
    if (val === '') {
        btn.textContent = 'TẠO';
    } else {
        btn.textContent = 'TÌM';
    }
}

// 3. Xử lý nút màu xanh dương (Tạo hoặc Tìm)
function actionTaoTkOrTim() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    
    if (val === '') {
        // TRƯỜNG HỢP 1: BẤM NÚT "TẠO" -> Chuyển sang form nhập thông tin KH
        document.getElementById('modal-tichdiem').style.display = 'none';
        document.getElementById('modal-taotk').style.display = 'block';
        document.getElementById('new-sdt').value = '';
        document.getElementById('new-ten').value = '';
    } else {
        // TRƯỜNG HỢP 2: BẤM NÚT "TÌM" -> Tìm kiếm trong Array
        foundCustomerTemp = customersArray.find(c => c.phone === val);
        
        if (foundCustomerTemp) {
            // Show thông tin khách hàng ra hộp
            document.getElementById('info-customer-box').style.display = 'flex';
            document.getElementById('info-sdt').innerText = foundCustomerTemp.phone;
            document.getElementById('info-ten').innerText = foundCustomerTemp.name;
            document.getElementById('info-ngay').innerText = foundCustomerTemp.date;
            document.getElementById('info-diem').innerText = foundCustomerTemp.points;
        } else {
            alert("Không tìm thấy khách hàng này! Vui lòng kiểm tra lại SĐT hoặc chọn Tạo mới.");
        }
    }
}

// 4. Xử lý Nút Xác Nhận của Form "Tạo Tài Khoản Mới"
function submitTaoTaiKhoan() {
    const phone = document.getElementById('new-sdt').value.trim();
    const name = document.getElementById('new-ten').value.trim();
    
    if(phone === '' || name === '') { 
        alert("Vui lòng nhập đủ thông tin SĐT và Họ Tên!"); 
        return; 
    }
    
    // Tạo khách hàng mới push vào array
    const newCust = { 
        phone: phone, 
        name: name, 
        date: new Date().toLocaleDateString('vi-VN'), 
        points: 0 
    };
    customersArray.push(newCust);
    
    alert("Tạo tài khoản tích điểm thành công!");
    currentCustomerName = newCust.name; // Lưu lại tên cho hóa đơn
    openHoaDonModal(); // Mở hóa đơn
}

// 5. Xử lý Nút Xác Nhận Xanh Lá khi "TÌM" thấy thông tin cũ
function confirmTichDiem() {
    if(foundCustomerTemp) {
        currentCustomerName = foundCustomerTemp.name; // Lưu lại tên
        openHoaDonModal();
    }
}

// 6. Xử lý Nút "BỎ QUA" Tích điểm
function skipTichDiem() {
    currentCustomerName = "null"; // Gán khách hàng rỗng
    openHoaDonModal();
}

// 7. Hàm Chuyển Cảnh mở màn hình Thông tin Hóa Đơn cuối cùng
function openHoaDonModal() {
    document.getElementById('modal-tichdiem').style.display = 'none';
    document.getElementById('modal-taotk').style.display = 'none';
    document.getElementById('modal-hoadon').style.display = 'flex';

    // Đổ dữ liệu Tên Khách Hàng vào Bill
    document.getElementById('receipt-customer').innerText = currentCustomerName;
    
    // Render danh sách sản phẩm từ Cart sang hóa đơn mini
    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        tbody.innerHTML += `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${formatMoney(item.price)}</td>
                <td>${item.qty}</td>
                <td>${formatMoney(itemTotal)}</td>
            </tr>
        `;
    });

    // Đổ tổng tiền
    document.getElementById('receipt-total').innerText = formatMoney(totalCartPrice);
    document.getElementById('receipt-final').innerText = formatMoney(totalCartPrice);
}

// 8. Đóng toàn bộ Modals
function closeAllModals() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// Kích hoạt đóng Modals nếu click vào vùng đen bên ngoài khung
function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') {
        closeAllModals();
    }
}

// 9. Nút hoàn tất thanh toán
function finishPayment() {
    alert("Thanh toán thành công! In hóa đơn hoàn tất.");
    clearCart(); // Xóa sạch giỏ hàng
    closeAllModals(); // Tắt popup
}