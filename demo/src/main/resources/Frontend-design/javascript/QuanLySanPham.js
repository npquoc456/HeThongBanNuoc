// =====================================================
// 1. KIỂM TRA ĐĂNG NHẬP, PHÂN QUYỀN & ĐỒNG HỒ TOPBAR
// =====================================================
let idnhanviendangnhap = localStorage.getItem('POS_STAFF_ID');
let tennhanviendangnhap = localStorage.getItem('POS_STAFF_NAME') || 'Nhân Viên';
let vaitrodangnhap = (localStorage.getItem('POS_STAFF_ROLE') || 'ADMIN').trim().toUpperCase();

// Phân quyền: Chỉ ADMIN mới được thêm, sửa, xóa. NHANVIEN chỉ được xem.
let isManagerMode = (vaitrodangnhap === 'ADMIN');

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

    // Áp dụng ẩn nút thêm sản phẩm nếu là nhân viên
    applyProductRoleUI();

    // Đóng menu lọc khi bấm ra ngoài
    document.addEventListener('click', function(e) {
        const wrapper = document.getElementById('filter-dropdown-wrapper');
        const menu = document.getElementById('filter-dropdown-menu');
        if (wrapper && menu && !wrapper.contains(e.target)) {
            menu.classList.remove('show');
        }
    });

    // Phím tắt ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                handleSearchInput();
            } else {
                closeAllModals();
                const menu = document.getElementById('filter-dropdown-menu');
                if (menu) menu.classList.remove('show');
            }
        }
    });
});

function applyProductRoleUI() {
    // Ẩn nút "+ Thêm Sản Phẩm Mới" và các nút thêm phụ dưới chân trang nếu không phải ADMIN
    const addButtons = document.querySelectorAll('.btn-add-product, .policy-add-btn');
    if (vaitrodangnhap !== 'ADMIN') {
        addButtons.forEach(btn => btn.style.display = 'none');
    }
}

function scaleApp() {
    const wrapper = document.getElementById('app-wrapper');
    if (!wrapper) return;
    const scale = Math.min(window.innerWidth / 1440, window.innerHeight / 1080);
    wrapper.style.transform = `scale(${scale})`;
}
window.addEventListener('resize', scaleApp);
scaleApp();

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

function chuyentrang(trang) {
    if (window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        window.location.href = trang;
    }
}

// =====================================================
// 2. BIẾN TOÀN CỤC & LƯU TRỮ TRẠNG THÁI / ẢNH LOCALSTORAGE
// =====================================================
const API_BASE_URL = 'http://localhost:8080/api/sanpham';
let productsDB = [];
let allProductsCache = [];
let currentCategory = 'ALL';
let currentCategoryName = 'Tất cả';
let currentSpPage = 1;
const itemsPerPage = 7;
let spLoadError = null;

let selectedImageFileName = "";
let selectedImageDataUrl = "";

function getSavedStatusMap() {
    try { return JSON.parse(localStorage.getItem('POS_SP_STATUS_MAP') || '{}'); } catch (e) { return {}; }
}

function saveProductStatusLocal(id, status) {
    const map = getSavedStatusMap();
    map[String(id)] = status;
    localStorage.setItem('POS_SP_STATUS_MAP', JSON.stringify(map));
}

function getSavedImagePreviewMap() {
    try { return JSON.parse(localStorage.getItem('POS_SP_IMG_PREVIEW_MAP') || '{}'); } catch (e) { return {}; }
}

function saveImagePreviewLocal(key, dataUrl) {
    if (!key || !dataUrl) return;
    try {
        const map = getSavedImagePreviewMap();
        map[String(key)] = dataUrl;
        localStorage.setItem('POS_SP_IMG_PREVIEW_MAP', JSON.stringify(map));
    } catch (e) {}
}

function resolveProductImageSrc(hinhAnh, id) {
    const previewMap = getSavedImagePreviewMap();
    if (id !== undefined && id !== null && previewMap[`ID_${id}`]) return previewMap[`ID_${id}`];
    if (hinhAnh && previewMap[hinhAnh]) return previewMap[hinhAnh];
    if (!hinhAnh) return "";
    if (hinhAnh.startsWith('data:image') || hinhAnh.startsWith('http') || hinhAnh.includes('/')) return hinhAnh;
    return `ICONS/${hinhAnh}`;
}

async function getApiErrorMessage(response, fallback) {
    const message = (await response.text()).trim();
    if (!message) return `${fallback} (HTTP ${response.status})`;
    try {
        const body = JSON.parse(message);
        return body.message || body.error || message;
    } catch (error) { return message; }
}

function mapSanPhamDtoToModel(sp) {
    const statusMap = getSavedStatusMap();
    const idStr = sp.id === null || sp.id === undefined ? "" : String(sp.id);
    const resolvedStatus = sp.trangThai || statusMap[idStr] || 'DANG_BAN';

    return {
        id: sp.id,
        code: formatProductCode(sp.id, sp.loaiSP),
        tenSP: sp.tenSP || "Chưa đặt tên",
        giaSP: sp.giaSP !== undefined && sp.giaSP !== null ? Number(sp.giaSP) : 0,
        moTa: sp.moTa || "",
        loaiSP: normalizeCategoryKey(sp.loaiSP),
        rawLoaiSP: sp.loaiSP || "CA_PHE",
        hinhAnh: sp.hinhAnh || "",
        cthdList: sp.cthdList || [],
        trangThai: resolvedStatus
    };
}

function normalizeCategoryKey(loai) {
    if (!loai) return 'CA_PHE';
    const upper = loai.toUpperCase().trim();
    if (upper.includes('CA_PHE') || upper.includes('CÀ PHÊ') || upper.includes('COFFEE')) return 'CA_PHE';
    if (upper.includes('TRA') || upper.includes('TRÀ') || upper.includes('TEA')) return 'TRA';
    if (upper.includes('MATCHA') || upper.includes('DA_XAY') || upper.includes('ĐÁ XAY') || upper.includes('SINH_TO')) return 'MATCHA';
    if (upper.includes('BANH') || upper.includes('BÁNH') || upper.includes('KHAC')) return 'BANH';
    return upper;
}

function formatProductCode(id, loai) {
    const cat = normalizeCategoryKey(loai);
    const num = String(id || 0).padStart(3, '0');
    if (cat === 'CA_PHE') return `CF-${num}`;
    if (cat === 'TRA') return `TEA-${num}`;
    if (cat === 'MATCHA') return `MAT-${num}`;
    if (cat === 'BANH') return `BAK-${num}`;
    return `SP-${num}`;
}

function formatCurrencyVN(amount) {
    return Number(amount || 0).toLocaleString('vi-VN') + 'đ';
}

// =====================================================
// 3. XỬ LÝ MENU LỌC (DROPDOWN) & GỌI REST API
// =====================================================
function toggleFilterMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById('filter-dropdown-menu');
    if (menu) menu.classList.toggle('show');
}

function updateFilterButtonLabel() {
    const labelEl = document.getElementById('filter-selected-label');
    const btnEl = document.getElementById('filter-dropdown-btn');
    if (!labelEl) return;

    let count = allProductsCache.length;
    if (currentCategory !== 'ALL') {
        count = allProductsCache.filter(s => s.loaiSP === currentCategory).length;
    }

    labelEl.innerText = `Lọc: ${currentCategoryName} (${count})`;
    if (btnEl) btnEl.classList.toggle('active-filter', currentCategory !== 'ALL');
}

function filterByCategory(category, categoryDisplayName) {
    currentCategory = category;
    currentCategoryName = categoryDisplayName || 'Tất cả';
    currentSpPage = 1;

    document.querySelectorAll('#filter-dropdown-menu .filter-menu-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-cat') === category);
    });

    const menu = document.getElementById('filter-dropdown-menu');
    if (menu) menu.classList.remove('show');

    updateFilterButtonLabel();
    fetchFilteredProductsFromApi();
}

async function loadSanPhamFromApi() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "Không tải được danh sách sản phẩm."));
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("API sản phẩm trả về dữ liệu không hợp lệ.");

        allProductsCache = data.map(mapSanPhamDtoToModel);
        spLoadError = null;
        updateCategoryCountsAndStats();
        await fetchFilteredProductsFromApi();
    } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        allProductsCache = [];
        productsDB = [];
        spLoadError = error.message || "Không thể kết nối đến API sản phẩm.";
        updateCategoryCountsAndStats();
        renderProductsTable();
    }
}
loadSanPhamFromApi();

let searchTimeout = null;
function handleSearchInput() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentSpPage = 1;
        fetchFilteredProductsFromApi();
    }, 200);
}

async function fetchFilteredProductsFromApi() {
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput ? searchInput.value.trim() : '';

    try {
        let url = API_BASE_URL;
        if (currentCategory !== 'ALL' && keyword !== '') {
            url = `${API_BASE_URL}/searchByLoaiAndTen?loai=${encodeURIComponent(currentCategory)}&tenSP=${encodeURIComponent(keyword)}`;
        } else if (currentCategory !== 'ALL') {
            url = `${API_BASE_URL}/searchByLoai?loai=${encodeURIComponent(currentCategory)}`;
        } else if (keyword !== '') {
            url = `${API_BASE_URL}/search?tenSP=${encodeURIComponent(keyword)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
                productsDB = data.map(mapSanPhamDtoToModel);
                renderProductsTable();
                return;
            }
        }
        filterProductsClientSide(keyword);
    } catch (e) {
        filterProductsClientSide(keyword);
    }
}

function filterProductsClientSide(keyword) {
    const kw = (keyword || '').toLowerCase();
    productsDB = allProductsCache.filter(sp => {
        const matchCat = currentCategory === 'ALL' || sp.loaiSP === currentCategory;
        const matchKw = !kw ||
            sp.tenSP.toLowerCase().includes(kw) ||
            sp.code.toLowerCase().includes(kw) ||
            String(sp.id).includes(kw) ||
            (sp.moTa && sp.moTa.toLowerCase().includes(kw));
        return matchCat && matchKw;
    });
    renderProductsTable();
}

// =====================================================
// 4. RENDER BẢNG SẢN PHẨM & PHÂN QUYỀN THAO TÁC
// =====================================================
function updateCategoryCountsAndStats() {
    const total = allProductsCache.length;
    const activeCount = allProductsCache.filter(sp => sp.trangThai !== 'TAM_HET_HANG' && sp.trangThai !== 'HET_HANG').length;
    const outCount = total - activeCount;

    const statTotalEl = document.getElementById('stat-total-sp');
    const statActiveEl = document.getElementById('stat-active-sp');
    const statOutEl = document.getElementById('stat-out-sp');

    if (statTotalEl) statTotalEl.innerHTML = `${total} <span>món đồ uống</span>`;
    if (statActiveEl) statActiveEl.innerHTML = `+${activeCount} <span class="text-green">sẵn sàng bán</span>`;
    if (statOutEl) statOutEl.innerHTML = `${String(outCount).padStart(2, '0')} <span class="text-red">cần nhập thêm</span>`;

    const countAll = document.getElementById('count-all');
    const countCaphe = document.getElementById('count-caphe');
    const countTra = document.getElementById('count-tra');
    const countMatcha = document.getElementById('count-matcha');
    const countBanh = document.getElementById('count-banh');

    if (countAll) countAll.innerText = total;
    if (countCaphe) countCaphe.innerText = allProductsCache.filter(s => s.loaiSP === 'CA_PHE').length;
    if (countTra) countTra.innerText = allProductsCache.filter(s => s.loaiSP === 'TRA').length;
    if (countMatcha) countMatcha.innerText = allProductsCache.filter(s => s.loaiSP === 'MATCHA').length;
    if (countBanh) countBanh.innerText = allProductsCache.filter(s => s.loaiSP === 'BANH').length;

    updateFilterButtonLabel();
}

const eyeIconSVG = `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const editIconSVG = `<svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
const trashIconSVG = `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

function getCategoryBadgeInfo(loaiSP) {
    switch (loaiSP) {
        case 'CA_PHE': return { label: 'Cà phê', cssClass: 'ca-phe', avatarClass: 'avatar-amber' };
        case 'TRA': return { label: 'Trà trái cây', cssClass: 'tra', avatarClass: 'avatar-orange' };
        case 'MATCHA': return { label: 'Matcha', cssClass: 'matcha', avatarClass: 'avatar-green' };
        case 'BANH': return { label: 'Bánh ngọt', cssClass: 'banh', avatarClass: 'avatar-amber' };
        default: return { label: loaiSP || 'Đồ uống', cssClass: 'ca-phe', avatarClass: 'avatar-blue' };
    }
}

function getAvatarLetter(name) {
    if (!name) return 'S';
    return name.trim().charAt(0).toUpperCase();
}

function renderProductsTable() {
    const container = document.getElementById('product-table-body');
    if (!container) return;
    container.innerHTML = '';

    const totalItems = productsDB.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
    if (currentSpPage > totalPages) currentSpPage = totalPages;

    const startIdx = (currentSpPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageItems = productsDB.slice(startIdx, endIdx);

    const paginationText = document.getElementById('pagination-text');
    if (paginationText) {
        const startNum = totalItems > 0 ? startIdx + 1 : 0;
        const endNum = Math.min(endIdx, totalItems);
        paginationText.innerHTML = `Hiển thị <b>${startNum}–${endNum}</b> trên <b>${totalItems}</b> sản phẩm`;
    }

    const pageInfoText = document.getElementById('page-info-text');
    if (pageInfoText) pageInfoText.innerText = `Trang ${currentSpPage}/${totalPages}`;

    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');
    if (btnPrev) btnPrev.disabled = currentSpPage <= 1;
    if (btnNext) btnNext.disabled = currentSpPage >= totalPages;

    if (pageItems.length === 0) {
        container.innerHTML = `<div style="padding: 40px; text-align: center; color: #888; font-weight: 500;">${spLoadError || 'Không tìm thấy sản phẩm nào phù hợp.'}</div>`;
        return;
    }

    pageItems.forEach((sp, idx) => {
        const isOut = sp.trangThai === 'TAM_HET_HANG' || sp.trangThai === 'HET_HANG';
        const catInfo = getCategoryBadgeInfo(sp.loaiSP);
        const letter = getAvatarLetter(sp.tenSP);
        const avatarColorClass = idx % 3 === 2 && sp.loaiSP === 'CA_PHE' ? 'avatar-blue' : catInfo.avatarClass;

        let mainDesc = sp.moTa || "Công thức pha chế tiêu chuẩn POS";
        let subNote = isOut ? "Tạm ngưng phục vụ trên POS" : "Size M / L • Đá riêng";
        if (sp.moTa && sp.moTa.includes('|')) {
            const parts = sp.moTa.split('|');
            mainDesc = parts[0].trim();
            subNote = parts[1].trim();
        }

        const noteColorClass = isOut || /best-seller|hết/i.test(subNote) ? 'note-red' : 'note-amber';
        const statusPillClass = isOut ? 'tam-het' : 'dang-ban';
        const statusPillText = isOut ? '● Tạm hết hàng' : '● Đang bán';

        const imgSrc = resolveProductImageSrc(sp.hinhAnh, sp.id);
        const avatarContent = imgSrc
            ? `<img src="${imgSrc}" alt="${sp.tenSP}" onerror="this.style.display='none'; this.parentElement.innerText='${letter}';">`
            : letter;

        // PHÂN QUYỀN: Nếu là NHANVIEN, không cho click đổi trạng thái, chỉ hiển thị icon xem chi tiết
        const statusAction = isManagerMode ? `onclick="toggleProductPosStatus(${sp.id})" title="Nhấn để đổi nhanh trạng thái bán"` : `style="cursor: default;" title="Chỉ quản lý mới được đổi trạng thái"`;
        const actionIconsHtml = isManagerMode ? `
            <span class="action-btn-icon" onclick="openViewSpModal(${sp.id})" title="Xem chi tiết">${eyeIconSVG}</span>
            <span class="action-btn-icon" onclick="openEditSpModal(${sp.id})" title="Chỉnh sửa">${editIconSVG}</span>
            <span class="action-btn-icon" onclick="openDeleteSpModal(${sp.id})" title="Xóa sản phẩm">${trashIconSVG}</span>
        ` : `
            <span class="action-btn-icon" onclick="openViewSpModal(${sp.id})" title="Xem chi tiết">${eyeIconSVG}</span>
            <span style="color: #9ca3af; font-size: 11px; font-weight: 600;">Chỉ xem</span>
        `;

        container.innerHTML += `
            <div class="table-row ${isOut ? 'row-out-of-stock' : ''}">
                <span class="sp-code">${sp.code}</span>
                <div class="product-info-cell">
                    <div class="product-avatar ${avatarColorClass}">${avatarContent}</div>
                    <div class="product-details">
                        <div class="product-name">${sp.tenSP}</div>
                        <div class="product-desc">${mainDesc}</div>
                        <div class="product-note ${noteColorClass}">${subNote}</div>
                    </div>
                </div>
                <div>
                    <span class="cat-pill ${catInfo.cssClass}">${catInfo.label}</span>
                </div>
                <span class="sp-price">${formatCurrencyVN(sp.giaSP)}</span>
                <div>
                    <span class="pos-status-pill ${statusPillClass}" ${statusAction}>${statusPillText}</span>
                </div>
                <div class="action-icons">
                    ${actionIconsHtml}
                </div>
            </div>
        `;
    });
}

function changeSpPage(newPage) {
    if (newPage < 1) return;
    currentSpPage = newPage;
    renderProductsTable();
}

function toggleProductPosStatus(id) {
    if (!isManagerMode) return;
    const target = allProductsCache.find(s => s.id === id);
    if (!target) return;

    const newStatus = (target.trangThai === 'TAM_HET_HANG' || target.trangThai === 'HET_HANG') ? 'DANG_BAN' : 'TAM_HET_HANG';
    target.trangThai = newStatus;
    saveProductStatusLocal(id, newStatus);

    const inCurrentList = productsDB.find(s => s.id === id);
    if (inCurrentList) inCurrentList.trangThai = newStatus;

    updateCategoryCountsAndStats();
    renderProductsTable();
}

// =====================================================
// 5. XỬ LÝ CHỌN FILE ẢNH & MODALS THÊM / SỬA / XÓA
// =====================================================
let currentEditSpId = null;
let tempSpPayload = null;
let currentDeleteSpId = null;

function handleImageFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    selectedImageFileName = file.name;
    const labelEl = document.getElementById('form-hinhAnh-label');
    if (labelEl) labelEl.innerText = file.name;

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 220;
            let w = img.width;
            let h = img.height;
            if (w > h && w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            selectedImageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            updateFormImagePreview(selectedImageDataUrl);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updateFormImagePreview(src) {
    const previewImg = document.getElementById('form-preview-img');
    const placeholder = document.getElementById('form-preview-placeholder');
    if (!previewImg || !placeholder) return;

    if (src) {
        previewImg.src = src;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        previewImg.src = '';
        previewImg.style.display = 'none';
        placeholder.style.display = 'block';
    }
}

function closeAllModals() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
    const modals = document.querySelectorAll('.modal-box');
    modals.forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') closeAllModals();
}

function openCreateSpModal() {
    if (!isManagerMode) return;
    closeAllModals();
    currentEditSpId = null;
    selectedImageFileName = "";
    selectedImageDataUrl = "";

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-sp-form').style.display = 'block';

    document.getElementById('modal-form-title').innerText = "Thêm Sản Phẩm Mới";
    document.getElementById('form-tenSP').value = '';
    document.getElementById('form-loaiSP').value = 'CA_PHE';
    document.getElementById('form-giaSP').value = '';
    document.getElementById('form-moTa').value = '';
    document.getElementById('form-trangThai').value = 'DANG_BAN';

    const fileInput = document.getElementById('form-hinhAnh-file');
    if (fileInput) fileInput.value = '';
    document.getElementById('form-hinhAnh-label').innerText = "Tải ảnh từ máy...";
    updateFormImagePreview("");
}

async function openEditSpModal(id) {
    if (!isManagerMode) return;
    closeAllModals();
    currentEditSpId = id;

    let item = allProductsCache.find(s => s.id === id);
    try {
        const res = await fetch(`${API_BASE_URL}/${id}`);
        if (res.ok) {
            const dto = await res.json();
            item = mapSanPhamDtoToModel(dto);
        }
    } catch (e) {}
    if (!item) return;

    selectedImageFileName = item.hinhAnh || "";
    selectedImageDataUrl = resolveProductImageSrc(item.hinhAnh, item.id);

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-sp-form').style.display = 'block';

    document.getElementById('modal-form-title').innerText = "Cập Nhật Sản Phẩm";
    document.getElementById('form-tenSP').value = item.tenSP;
    document.getElementById('form-loaiSP').value = item.loaiSP;
    document.getElementById('form-giaSP').value = item.giaSP;
    document.getElementById('form-moTa').value = item.moTa;
    document.getElementById('form-trangThai').value = item.trangThai === 'TAM_HET_HANG' ? 'TAM_HET_HANG' : 'DANG_BAN';

    const fileInput = document.getElementById('form-hinhAnh-file');
    if (fileInput) fileInput.value = '';
    document.getElementById('form-hinhAnh-label').innerText = selectedImageFileName || "Tải ảnh từ máy...";
    updateFormImagePreview(selectedImageDataUrl);
}

function submitSpForm() {
    if (!isManagerMode) return;
    const tenSP = document.getElementById('form-tenSP').value.trim();
    const loaiSP = document.getElementById('form-loaiSP').value;
    const giaSP = parseFloat(document.getElementById('form-giaSP').value);
    const moTa = document.getElementById('form-moTa').value.trim();
    const trangThai = document.getElementById('form-trangThai').value;

    if (!tenSP || isNaN(giaSP) || giaSP < 0) {
        alert("Vui lòng nhập tên sản phẩm và giá bán hợp lệ!");
        return;
    }

    tempSpPayload = {
        id: currentEditSpId,
        tenSP: tenSP,
        giaSP: giaSP,
        moTa: moTa,
        loaiSP: loaiSP,
        hinhAnh: selectedImageFileName,
        previewDataUrl: selectedImageDataUrl,
        trangThai: trangThai
    };

    const catInfo = getCategoryBadgeInfo(loaiSP);
    document.getElementById('confirm-id').innerText = currentEditSpId ? formatProductCode(currentEditSpId, loaiSP) : "MỚI";
    document.getElementById('confirm-name').innerText = tenSP;
    document.getElementById('confirm-price').innerText = `${catInfo.label} • ${formatCurrencyVN(giaSP)}`;
    document.getElementById('confirm-mota').innerText = moTa || "Không có mô tả";
    document.getElementById('confirm-hinhanh').innerText = selectedImageFileName || "Chưa chọn ảnh";

    const thumbEl = document.getElementById('confirm-img-thumb');
    if (thumbEl) {
        if (selectedImageDataUrl) {
            thumbEl.src = selectedImageDataUrl;
            thumbEl.style.display = 'block';
        } else {
            thumbEl.style.display = 'none';
        }
    }

    const statusBox = document.getElementById('confirm-status-box');
    const isOut = trangThai === 'TAM_HET_HANG';
    document.getElementById('confirm-status').innerText = isOut ? 'Tạm hết hàng' : 'Đang bán';
    statusBox.style.backgroundColor = isOut ? '#B30000' : '#008A5A';

    document.getElementById('confirm-btn-group').style.display = 'flex';
    document.getElementById('confirm-title').innerText = currentEditSpId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới";
    document.getElementById('confirm-subtitle').innerText = "Xác nhận thông tin sản phẩm";
    document.getElementById('confirm-submit-btn').innerText = currentEditSpId ? "CẬP NHẬT" : "THÊM MỚI";

    document.getElementById('modal-sp-form').style.display = 'none';
    document.getElementById('modal-sp-confirm').style.display = 'block';
}

async function confirmAndSaveSp() {
    if (!isManagerMode || !tempSpPayload) return;

    const dtoBody = {
        tenSP: tempSpPayload.tenSP,
        giaSP: tempSpPayload.giaSP,
        moTa: tempSpPayload.moTa,
        loaiSP: tempSpPayload.loaiSP,
        hinhAnh: tempSpPayload.hinhAnh,
        trangThai: tempSpPayload.trangThai
    };

    try {
        if (currentEditSpId) {
            dtoBody.id = currentEditSpId;
            const response = await fetch(`${API_BASE_URL}/${currentEditSpId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dtoBody)
            });
            if (!response.ok) throw new Error(await getApiErrorMessage(response, "Không thể cập nhật sản phẩm."));
            saveProductStatusLocal(currentEditSpId, tempSpPayload.trangThai);
            if (tempSpPayload.previewDataUrl) {
                saveImagePreviewLocal(`ID_${currentEditSpId}`, tempSpPayload.previewDataUrl);
                saveImagePreviewLocal(tempSpPayload.hinhAnh, tempSpPayload.previewDataUrl);
            }
        } else {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dtoBody)
            });
            if (!response.ok) throw new Error(await getApiErrorMessage(response, "Không thể thêm sản phẩm mới."));
            const createdSp = await response.json();
            if (createdSp && createdSp.id !== undefined) {
                saveProductStatusLocal(createdSp.id, tempSpPayload.trangThai);
                if (tempSpPayload.previewDataUrl) {
                    saveImagePreviewLocal(`ID_${createdSp.id}`, tempSpPayload.previewDataUrl);
                    saveImagePreviewLocal(tempSpPayload.hinhAnh, tempSpPayload.previewDataUrl);
                }
            }
        }

        tempSpPayload = null;
        closeAllModals();
        await loadSanPhamFromApi();
    } catch (error) {
        console.error("Lỗi lưu sản phẩm:", error);
        alert(error.message || "Có lỗi xảy ra khi kết nối máy chủ.");
    }
}

async function openViewSpModal(id) {
    let item = allProductsCache.find(s => s.id === id);
    try {
        const res = await fetch(`${API_BASE_URL}/${id}`);
        if (res.ok) {
            const dto = await res.json();
            item = mapSanPhamDtoToModel(dto);
        }
    } catch (e) {}
    if (!item) return;

    closeAllModals();
    const catInfo = getCategoryBadgeInfo(item.loaiSP);
    const isOut = item.trangThai === 'TAM_HET_HANG' || item.trangThai === 'HET_HANG';

    document.getElementById('confirm-title').innerText = "Chi tiết sản phẩm";
    document.getElementById('confirm-subtitle').innerText = "Thông tin chi tiết trên hệ thống POS";
    document.getElementById('confirm-id').innerText = item.code;
    document.getElementById('confirm-name').innerText = item.tenSP;
    document.getElementById('confirm-price').innerText = `${catInfo.label} • ${formatCurrencyVN(item.giaSP)}`;
    document.getElementById('confirm-mota').innerText = item.moTa || "Không có mô tả";
    document.getElementById('confirm-hinhanh').innerText = item.hinhAnh || "Chưa chọn ảnh";

    const thumbEl = document.getElementById('confirm-img-thumb');
    const imgSrc = resolveProductImageSrc(item.hinhAnh, item.id);
    if (thumbEl) {
        if (imgSrc) {
            thumbEl.src = imgSrc;
            thumbEl.style.display = 'block';
        } else {
            thumbEl.style.display = 'none';
        }
    }

    const statusBox = document.getElementById('confirm-status-box');
    document.getElementById('confirm-status').innerText = isOut ? 'Tạm hết hàng' : 'Đang bán';
    statusBox.style.backgroundColor = isOut ? '#B30000' : '#008A5A';

    document.getElementById('confirm-btn-group').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-sp-confirm').style.display = 'block';
}

function openDeleteSpModal(id) {
    if (!isManagerMode) return;
    const item = allProductsCache.find(s => s.id === id);
    if (!item) return;

    currentDeleteSpId = id;
    closeAllModals();

    document.getElementById('del-sp-id').innerText = item.code;
    document.getElementById('del-sp-name').innerText = item.tenSP;
    document.getElementById('del-sp-price').innerText = formatCurrencyVN(item.giaSP);

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-sp-delete').style.display = 'block';
}

async function submitDeleteSp() {
    if (!isManagerMode || currentDeleteSpId === null) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${currentDeleteSpId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await getApiErrorMessage(response, "Không thể xóa sản phẩm."));
        closeAllModals();
        await loadSanPhamFromApi();
    } catch (error) {
        console.error("Lỗi xóa sản phẩm:", error);
        alert(error.message || "Không thể xóa sản phẩm này.");
    }
}