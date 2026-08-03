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

        let ingredientsDB = [];

        async function loadnguyenlieufromapi(){
            try{
                const response = await fetch('http://localhost:8080/api/nguyenlieu')

                if(!response.ok){
                    throw new Error("Lỗi máy chủ: " + response.status)
                }

                const data = await response.json(); 
                
                ingredientsDB = data.map( nl => {
                    return {
                        id: nl.id.toString(),
                        name: nl.tenNL, 
                        qty: nl.soLuong, 
                        unit: nl.donVi, 
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

        // Mã SVG Icon Edit
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
                        <span>${item.unit}</span>
                        <span style="color: ${colorTrangThai}; font-weight: bold;">${textTrangThai}</span>
                        <div class="action-icons">
                            <img src="ICONS/viewicon.png" alt="View">
                            ${editIconSVG}
                            <img src="ICONS/Deleteicon.png" alt="Delete">
                        </div>
                    </div>
                `;
            });
        }

        function chuyentrang(trang) {
            window.javaBackend.loadTrang(trang);
        }