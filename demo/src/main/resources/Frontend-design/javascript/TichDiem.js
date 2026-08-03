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
                            <img src="ICONS/viewicon.png" alt="View">
                            ${editIconSVG}
                            <img src="ICONS/Deleteicon.png" alt="Delete">
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
        updateCurrentTime(); // Gọi ngay khi tải trang

        
       function chuyentrang(trang) {
            window.javaBackend.loadTrang(trang);
        }
        renderCustomers();