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

        //them san pham vao card 
        let productsDB = [];
        let cart = [];
        let currentCategory = 'all'; 

        //goi api
        async function loadproductfromapi() {
            try{
                const response = await fetch('http://localhost:8080/api/sanpham')

                if(!response.ok){
                   throw new Error("loi may chu" + response.status)
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

        //loc sp
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
        // Khởi chạy
        loadproductfromapi();


        //thêm hàng vào giỏ
        function addToCart(productId) {
            const product = productsDB.find(p => p.id === productId); //tìm thông tin dựa vào id
            const existingItem = cart.find(item => item.id === productId); //có nằm trong dỏ hay k

            if (existingItem) {
                existingItem.qty += 1;
            } else {
                cart.push({ ...product, qty: 1 });
            }
            renderCart();
        }
        //tang giam
        function updateQty(productId, change) {
            const item = cart.find(i => i.id === productId); //ktra xem co nam trong ds k
            if (item) {
                item.qty += change;
                if (item.qty <= 0) {
                    cart = cart.filter(i => i.id !== productId); //loai bo don hang
                }
                renderCart();
            }
        }

        //nhap truc tiep so luong
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

        //ve lai gio hang va tinh tien 
        function renderCart() {
            const list = document.getElementById('cart-list'); //xoa trang do hang
            list.innerHTML = '';
            let total = 0;

            cart.forEach(item => {
                const itemTotal = item.price * item.qty;
                total += itemTotal;

                list.innerHTML += `
                    <div class="cart-item">
                        <span>${item.id}</span>
                        <span>${item.name}</span>
                        <span>${formatMoney(item.price)}</span>
                        
                        <div class="qty-control">
                            <button onclick="updateQty('${item.id}', -1)">-</button> <!-- ham tru -->

                            <input type="number" value="${item.qty}" min="1" onchange="setQty('${item.id}', this.value)">

                            <button onclick="updateQty('${item.id}', 1)">+</button> <!-- ham cong -->
                        </div>
                        
                        <span>${formatMoney(itemTotal)}</span>
                    </div>
                `;
            });

            document.getElementById('total-price').innerText = formatMoney(total);
            document.getElementById('final-price').innerText = formatMoney(total);
        }

        //xoa tat ca
        function clearCart() {
            cart = [];
            renderCart();
        }

        function chuyentrang(trang) {
            window.javaBackend.loadTrang(trang);
        }

        filterProducts('all');