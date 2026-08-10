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
let totalCartPrice = 0; 

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
loadproductfromapi();

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

function renderCart() {
    const list = document.getElementById('cart-list'); 
    list.innerHTML = '';
    
    totalCartPrice = 0;

    if(cart.length === 0) {
        list.innerHTML = "Đơn hàng trống";
    }

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

function clearCart() {
    cart = [];
    renderCart();
}

function updateCurrentTime() {
    const now = new Date();
    const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('vi-VN');
    
    document.getElementById('current-date').textContent = dateStr;
    document.getElementById('current-time').textContent = timeStr;
    
    const receiptDateEl = document.getElementById('receipt-date');
    if (receiptDateEl) {
        receiptDateEl.textContent = now.toLocaleDateString('vi-VN');
    }
}

setInterval(updateCurrentTime, 1000);
updateCurrentTime(); 

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

let customersArray = [];

async function loadCustomersFromAPI() {
    try {
        const response = await fetch('http://localhost:8080/api/tktrungthanh');
        if (!response.ok) {
            throw new Error("Lỗi máy chủ " + response.status);
        }
        const data = await response.json();
        customersArray = data.map(c => ({
            id: c.id.toString(),
            name: c.tenKH,
            date: c.ngayTao,
            points: c.soLuongMua
        }));
    } catch (error) {
        console.error("Không thể tải dữ liệu khách hàng:", error);
    }
}
loadCustomersFromAPI();

let currentCustomerName = "null"; 
let foundCustomerTemp = null; 

function openTichDiemModal() {
    if (cart.length === 0) { 
        alert("Giỏ hàng đang trống! Vui lòng chọn món trước khi thanh toán."); 
        return; 
    }
    
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-tichdiem').style.display = 'flex';
    document.getElementById('sdt-tichdiem-input').value = '';
    document.getElementById('info-customer-box').style.display = 'none';
    handlePhoneInput(); 
}

function handlePhoneInput() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    const btn = document.getElementById('btn-action-tichdiem');
    document.getElementById('info-customer-box').style.display = 'none'; 
    if (val === '') { btn.textContent = 'TẠO'; } else { btn.textContent = 'TÌM'; }
}

function actionTaoTkOrTim() {
    const val = document.getElementById('sdt-tichdiem-input').value.trim();
    if (val === '') {
        document.getElementById('modal-tichdiem').style.display = 'none';
        document.getElementById('modal-taotk').style.display = 'block';
        document.getElementById('new-sdt').value = '';
        document.getElementById('new-ten').value = '';
    } else {
        foundCustomerTemp = customersArray.find(c => c.id === val);
        if (foundCustomerTemp) {
            document.getElementById('info-customer-box').style.display = 'flex';
            document.getElementById('info-sdt').innerText = foundCustomerTemp.id;
            document.getElementById('info-ten').innerText = foundCustomerTemp.name;
            document.getElementById('info-ngay').innerText = foundCustomerTemp.date;
            document.getElementById('info-diem').innerText = foundCustomerTemp.points;
        } else {
            alert("Không tìm thấy khách hàng này! Vui lòng kiểm tra lại SĐT hoặc chọn Tạo mới.");
        }
    }
}

function submitTaoTaiKhoan() {
    const phone = document.getElementById('new-sdt').value.trim();
    const name = document.getElementById('new-ten').value.trim();
    if(phone === '' || name === '') { alert("Vui lòng nhập đủ thông tin SĐT và Họ Tên!"); return; }
    const newCust = { id: phone, name: name, date: new Date().toLocaleDateString('vi-VN'), points: 0 };
    customersArray.push(newCust);
    
    alert("Tạo tài khoản tích điểm thành công!");
    currentCustomerName = newCust.name; 
    openHoaDonModal(); 
}

function confirmTichDiem() {
    if(foundCustomerTemp) {
        currentCustomerName = foundCustomerTemp.name; 
        openHoaDonModal();
    }
}

function skipTichDiem() {
    currentCustomerName = "null"; 
    openHoaDonModal();
}

function openHoaDonModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-hoadon').style.display = 'flex';

    document.getElementById('receipt-id').innerText = Math.floor(Math.random() * 1000);
    document.getElementById('receipt-customer').innerText = currentCustomerName;
    
    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.qty;
        tbody.innerHTML += `
            <tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(itemTotal)}</td></tr>
        `;
    });

    document.getElementById('receipt-total').innerText = formatMoney(totalCartPrice);
    document.getElementById('receipt-final').innerText = formatMoney(totalCartPrice);
}

function finishPayment() {
    alert("Thanh toán thành công! In hóa đơn hoàn tất.");
    clearCart(); 
    closeAllModals(); 
}

/* =======================================================================
   ================= PHẦN XỬ LÝ DANH SÁCH & CHI TIẾT HÓA ĐƠN =============
   ======================================================================= */

let mockBillsArray = [
    { id: "1", date: "27/7/2026", total: 50000, status: "Đã thanh toán", customer: "Alo vũ à vũ", items: [{id: "A123", name: "Coffee", price: 15000, qty: 1}, {id: "A124", name: "Tea", price: 10000, qty: 2}] },
    { id: "2", date: "27/7/2026", total: 20000, status: "Đã hủy", customer: "Alo vũ à vũ", items: [{id: "A123", name: "Coffee", price: 15000, qty: 1}, {id: "A126", name: "Milk", price: 5000, qty: 1}] },
    { id: "3", date: "27/7/2026", total: 60000, status: "Chờ xác nhận", customer: "Trần Văn B", items: [{id: "A125", name: "Milk Coffee", price: 20000, qty: 3}] }
];

const editIconSvg = `<svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

function openBillListModal() {
    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-bill-list').style.display = 'block';
    document.getElementById('bill-search-input').value = ''; 
    renderBillList();
}

function renderBillList() {
    const tbody = document.getElementById('bill-list-body');
    const keyword = document.getElementById('bill-search-input').value.trim().toLowerCase();
    tbody.innerHTML = '';

    const filteredBills = mockBillsArray.filter(bill => 
        bill.id.toLowerCase().includes(keyword)
    );

    filteredBills.forEach(bill => {
        let color = '';
        if (bill.status === 'Đã thanh toán') color = '#008A5A';
        else if (bill.status === 'Đã hủy') color = '#CC0000';
        else if (bill.status === 'Chờ xác nhận') color = '#0000CC';

        // Đổ dữ liệu vào đúng theo khung Grid CSS
        tbody.innerHTML += `
            <div class="bill-row-grid bill-data-row">
                <span>${bill.id}</span>
                <span>Nguyễn Phú Quốc</span> <!-- Trống cho khoảng trống của ô Search -->
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
    tbody.innerHTML = '';
    bill.items.forEach(item => {
        tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
    });

    const statusBtn = document.getElementById('detail-status-btn');
    
    if (bill.status === 'Đã thanh toán') {
        statusBtn.className = 'btn-status btn-status-paid';
        statusBtn.textContent = 'ĐÃ THANH TOÁN';
        statusBtn.onclick = function() { alert('Hóa đơn này đã được thanh toán!'); };
    } 
    else if (bill.status === 'Đã hủy') {
        statusBtn.className = 'btn-status btn-status-cancelled';
        statusBtn.textContent = 'ĐÃ HỦY';
        statusBtn.onclick = function() { openPaymentForOldBill(billId); };
    } 
    else if (bill.status === 'Chờ xác nhận') {
        statusBtn.className = 'btn-status btn-status-pending';
        statusBtn.textContent = 'CHỜ XÁC NHẬN';
        statusBtn.onclick = function() { openPaymentForOldBill(billId); };
    }
}

function openPaymentForOldBill(billId) {
    const bill = mockBillsArray.find(b => b.id === billId);
    if(!bill) return;

    closeAllModals();
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-hoadon').style.display = 'flex';

    document.getElementById('receipt-id').innerText = bill.id;
    document.getElementById('receipt-date').innerText = bill.date;
    document.getElementById('receipt-customer').innerText = bill.customer;
    
    const tbody = document.getElementById('receipt-body');
    tbody.innerHTML = '';
    bill.items.forEach(item => {
        tbody.innerHTML += `<tr><td>${item.id}</td><td>${item.name}</td><td>${formatMoney(item.price)}</td><td>${item.qty}</td><td>${formatMoney(item.price * item.qty)}</td></tr>`;
    });

    document.getElementById('receipt-total').innerText = formatMoney(bill.total);
    document.getElementById('receipt-final').innerText = formatMoney(bill.total);
}

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