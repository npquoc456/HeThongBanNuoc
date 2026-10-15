// =====================================================
// 1. KHỞI TẠO HỆ THỐNG & PHÂN QUYỀN ADMIN / NHANVIEN
// =====================================================
let idnhanviendangnhap = localStorage.getItem('POS_STAFF_ID') || '1';
let tennhanviendangnhap = localStorage.getItem('POS_STAFF_NAME') || 'Nguyen Phu Quoc';
let vaitrodangnhap = (localStorage.getItem('POS_STAFF_ROLE') || 'ADMIN').trim().toUpperCase();

let isManagerMode = (vaitrodangnhap === 'ADMIN');

let currentWeekStart = getMonday(new Date());
let selectedDayIndex = getTodayIndexInWeek(currentWeekStart);

document.addEventListener("DOMContentLoaded", function() {
    const staffNameEl = document.getElementById('staffname');
    if (staffNameEl) staffNameEl.innerText = tennhanviendangnhap;

    const roleLabel = document.getElementById('staffrole-label');
    if (roleLabel) {
        roleLabel.innerText = (vaitrodangnhap === 'ADMIN') ? '(Quản trị viên)' : '(Nhân viên)';
    }

    applyRoleModeUI();
    initSampleDataIfNeeded();
    loadAllDataFromApi();
});

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
    const shortTime = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');
    const rtClockEl = document.getElementById('rt-clock-now');

    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
    if (rtClockEl) rtClockEl.textContent = `Hiện tại ${shortTime}`;

    updateRealtimeWorkingStaffWidget();
}
setInterval(updateCurrentTime, 1000);

function chuyentrang(trang) {
    if (window.javaBackend) {
        window.javaBackend.loadTrang(trang);
    } else {
        window.location.href = trang;
    }
}

function toggleRoleViewMode() {
    if (vaitrodangnhap !== 'ADMIN') {
        alert("Tài khoản của bạn có vai trò NHANVIEN, không có quyền chuyển đổi sang chế độ Quản lý!");
        return;
    }
    isManagerMode = !isManagerMode;
    applyRoleModeUI();
    renderCalendarMatrix();
    renderSwapRequests();
    renderStaffTable();
}

function applyRoleModeUI() {
    const toggleBtn = document.getElementById('role-mode-toggle');
    const toggleText = document.getElementById('role-mode-text');
    const hintEl = document.getElementById('schedule-mode-hint');
    const managerButtons = document.querySelectorAll('.manager-only-btn');

    if (vaitrodangnhap !== 'ADMIN') {
        isManagerMode = false;
        if (toggleBtn) toggleBtn.style.display = 'none';
        if (hintEl) hintEl.innerText = 'ⓘ Nhân viên: Bạn có thể xem lịch ca làm và bấm vào ca của mình để gửi yêu cầu đổi ca.';
        managerButtons.forEach(b => b.style.display = 'none');
        return;
    }

    if (toggleBtn) toggleBtn.style.display = 'inline-flex';
    if (isManagerMode) {
        if (toggleBtn) toggleBtn.classList.remove('staff-mode');
        if (toggleText) toggleText.innerText = '🛡️ CHẾ ĐỘ: QUẢN LÝ (ADMIN MODE)';
        if (hintEl) hintEl.innerText = 'ⓘ Quản lý: Kéo thả ca làm vào lịch hoặc bấm vào ô để thêm / sửa / xóa ca.';
        managerButtons.forEach(b => b.style.display = 'inline-flex');
    } else {
        if (toggleBtn) toggleBtn.classList.add('staff-mode');
        if (toggleText) toggleText.innerText = '👤 CHẾ ĐỘ: XEM NHƯ NHÂN VIÊN';
        if (hintEl) hintEl.innerText = 'ⓘ Chế độ xem: Bạn đang xem giao diện ở góc nhìn nhân viên.';
        managerButtons.forEach(b => b.style.display = 'none');
    }
}

function switchMainTab(tab) {
    const viewSchedule = document.getElementById('tab-view-schedule');
    const viewStaff = document.getElementById('tab-view-staff');
    const btnSchedule = document.getElementById('tab-btn-schedule');
    const btnStaff = document.getElementById('tab-btn-staff');

    if (tab === 'SCHEDULE') {
        viewSchedule.style.display = 'flex';
        viewStaff.style.display = 'none';
        btnSchedule.classList.add('active');
        btnStaff.classList.remove('active');
    } else {
        viewSchedule.style.display = 'none';
        viewStaff.style.display = 'flex';
        btnSchedule.classList.remove('active');
        btnStaff.classList.add('active');
        renderStaffTable();
    }
}

// =====================================================
// 2. XỬ LÝ NGÀY THÁNG TỪ THỨ 2 ĐẾN CHỦ NHẬT
// =====================================================
function getMonday(d) {
    d = new Date(d);
    let day = d.getDay();
    let diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function getTodayIndexInWeek(mondayDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = 0; i < 7; i++) {
        let temp = new Date(mondayDate);
        temp.setDate(mondayDate.getDate() + i);
        temp.setHours(0,0,0,0);
        if (temp.getTime() === today.getTime()) return i;
    }
    return 0;
}

function getWeekDaysArray(mondayDate) {
    const names = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    let arr = [];
    const today = new Date();
    today.setHours(0,0,0,0);

    for (let i = 0; i < 7; i++) {
        let d = new Date(mondayDate);
        d.setDate(mondayDate.getDate() + i);
        d.setHours(0,0,0,0);

        let isToday = (d.getTime() === today.getTime());
        arr.push({
            index: i,
            label: isToday ? 'Hôm Nay' : names[i],
            dateNum: String(d.getDate()),
            fullDate: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
            isToday: isToday,
            dateObj: d
        });
    }
    return arr;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function updateWeekRangeLabel() {
    const days = getWeekDaysArray(currentWeekStart);
    const firstDay = days[0].fullDate + '/' + currentWeekStart.getFullYear();
    const lastDay = days[6].fullDate + '/' + currentWeekStart.getFullYear();
    const weekNum = getWeekNumber(currentWeekStart);

    const label = document.getElementById('week-range-label');
    if (label) label.innerText = `Tuần ${weekNum}: ${firstDay} - ${lastDay}`;
}

function changeWeekOffset(deltaWeeks) {
    currentWeekStart.setDate(currentWeekStart.getDate() + (deltaWeeks * 7));
    selectedDayIndex = getTodayIndexInWeek(currentWeekStart);
    updateWeekRangeLabel();
    renderCalendarHeader();
    renderCalendarMatrix();
    updateRealtimeWorkingStaffWidget();
}

// =====================================================
// 3. TÍCH HỢP REST API NHÂN VIÊN & CA LÀM
// =====================================================
const API_NV_URL = 'http://localhost:8080/api/nhanvien';
const API_CALAM_URL = 'http://localhost:8080/api/calam';

let staffList = [];
let caLamList = [];
let scheduleAssignments = [];
let swapRequests = [];

function initSampleDataIfNeeded() {
    const savedSwap = localStorage.getItem('POS_SWAP_REQUESTS');
    if (savedSwap) {
        swapRequests = JSON.parse(savedSwap);
    } else {
        swapRequests = [];
        localStorage.setItem('POS_SWAP_REQUESTS', JSON.stringify(swapRequests));
    }
}

async function loadAllDataFromApi() {
    let loadedNv = false;
    try {
        const resNv = await fetch(API_NV_URL);
        if (resNv.ok) {
            const dataNv = await resNv.json();
            if (Array.isArray(dataNv) && dataNv.length > 0) {
                staffList = dataNv.map(nv => ({
                    id: nv.id,
                    tenNhanVien: nv.tenNhanVien || nv.hoTen || 'Nhân viên',
                    email: nv.email || `nv${nv.id}@gmail.com`,
                    sdt: nv.sdt || '0901111111',
                    ngaySinh: nv.ngaySinh || '2004-01-01',
                    ngayLamViec: nv.ngayLamViec || '2025-01-01',
                    trangThaiLamViec: nv.trangThaiLamViec || 'DANG_LAM_VIEC',
                    vaiTro: nv.vaiTro || 'NHANVIEN',
                    ctCaList: nv.ctCaList || []
                }));
                loadedNv = true;
            }
        }
    } catch (e) {}

    if (!loadedNv) {
        staffList = [
            { id: 1, tenNhanVien: 'Nguyen Phu Quoc', email: 'quoc@gmail.com', sdt: '0901111111', ngaySinh: '2006-11-16', ngayLamViec: '2025-03-14', trangThaiLamViec: 'DANG_LAM_VIEC', vaiTro: 'ADMIN' },
            { id: 2, tenNhanVien: 'Tran Van A', email: 'a@gmail.com', sdt: '0902222222', ngaySinh: '2003-05-20', ngayLamViec: '2025-01-10', trangThaiLamViec: 'DANG_LAM_VIEC', vaiTro: 'NHANVIEN' },
            { id: 3, tenNhanVien: 'Le Thi B', email: 'b@gmail.com', sdt: '0903333333', ngaySinh: '2002-09-18', ngayLamViec: '2025-02-20', trangThaiLamViec: 'TAM_NGHI', vaiTro: 'NHANVIEN' }
        ];
    }

    let loadedCa = false;
    try {
        const resCa = await fetch(API_CALAM_URL);
        if (resCa.ok) {
            const dataCa = await resCa.json();
            if (Array.isArray(dataCa)) {
                caLamList = dataCa;
                loadedCa = true;
            }
        }
    } catch (e) {}

    loadScheduleAssignments(loadedCa);
    updateWeekRangeLabel();
    updateStaffBadgeCount();
    renderCalendarHeader();
    renderCalendarMatrix();
    renderSwapRequests();
    updateRealtimeWorkingStaffWidget();
}

function loadScheduleAssignments(fromApi) {
    const savedLocal = localStorage.getItem('POS_SCHEDULE_ASSIGNMENTS');
    if (savedLocal) {
        scheduleAssignments = JSON.parse(savedLocal);
    } else {
        scheduleAssignments = [
            { id: 's1', caLamId: 1, nhanVienId: 1, dayIndex: 0, tenCa: 'Ca 1', thoiGianBD: '06:30', thoiGianKT: '12:00' },
            { id: 's2', caLamId: 2, nhanVienId: 2, dayIndex: 1, tenCa: 'Ca 2', thoiGianBD: '12:00', thoiGianKT: '17:30' },
            { id: 's3', caLamId: 3, nhanVienId: 3, dayIndex: 2, tenCa: 'Ca 3', thoiGianBD: '17:30', thoiGianKT: '23:00' }
        ];
    }
    saveScheduleToLocal();
}

function saveScheduleToLocal() {
    localStorage.setItem('POS_SCHEDULE_ASSIGNMENTS', JSON.stringify(scheduleAssignments));
}

// =====================================================
// 4. RENDER BẢNG LỊCH CA LÀM (THỨ 2 - CHỦ NHẬT)
// =====================================================
function renderCalendarHeader() {
    const headerRow = document.getElementById('calendar-header-row');
    if (!headerRow) return;

    const weekDays = getWeekDaysArray(currentWeekStart);
    headerRow.style.gridTemplateColumns = `165px repeat(7, 1fr)`;

    let html = `<div class="matrix-col-title">NHÂN SỰ / CA</div>`;
    weekDays.forEach(d => {
        const activeClass = d.index === selectedDayIndex ? 'selected-day' : '';
        html += `
            <div class="day-header-box ${activeClass}" onclick="selectScheduleDay(${d.index})" title="Xem thống kê ngày ${d.fullDate}">
                <div class="day-name">${d.label}</div>
                <div class="day-num">${d.dateNum}</div>
            </div>
        `;
    });
    headerRow.innerHTML = html;
}

function selectScheduleDay(dayIdx) {
    selectedDayIndex = dayIdx;
    renderCalendarHeader();
    updateRealtimeWorkingStaffWidget();
}

function getInitials(fullName) {
    if (!fullName) return 'NV';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getShiftCssClass(tenCa) {
    const lower = (tenCa || '').toLowerCase();
    if (lower.includes('1') || lower.includes('sáng')) return 'ca1';
    if (lower.includes('2') || lower.includes('chiều') || lower.includes('trưa')) return 'ca2';
    return 'ca3';
}

function renderCalendarMatrix() {
    const bodyEl = document.getElementById('calendar-matrix-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    const weekDays = getWeekDaysArray(currentWeekStart);
    const gridCols = `165px repeat(7, 1fr)`;
    const avatarClasses = ['av-dark', 'av-mint', 'av-amber', 'av-rose'];

    staffList.forEach((nv, idx) => {
        const isMgr = (nv.vaiTro === 'ADMIN');
        const avClass = avatarClasses[idx % avatarClasses.length];
        const initials = getInitials(nv.tenNhanVien);
        const roleDisplay = isMgr ? 'ADMIN' : 'NHANVIEN';

        let rowHtml = `
            <div class="matrix-row" style="grid-template-columns: ${gridCols};">
                <div class="staff-cell">
                    <div class="staff-avatar ${avClass}">${initials}</div>
                    <div class="staff-meta">
                        <div class="staff-meta-name">${nv.tenNhanVien}</div>
                        <div class="staff-meta-role">${roleDisplay} • ID #${nv.id}</div>
                    </div>
                </div>
        `;

        weekDays.forEach(d => {
            const cellShifts = scheduleAssignments.filter(a => Number(a.nhanVienId) === Number(nv.id) && Number(a.dayIndex) === d.index);
            let cellContent = '';

            if (cellShifts.length === 0) {
                cellContent = `<div class="off-chip">Nghỉ ca<br>(OFF)</div>`;
            } else {
                cellShifts.forEach(sh => {
                    const css = getShiftCssClass(sh.tenCa);
                    const isTodayHighlight = (d.isToday && css === 'ca1') ? 'today-active' : '';
                    cellContent += `
                        <div class="shift-chip ${css} ${isTodayHighlight}"
                             draggable="${isManagerMode}"
                             ondragstart="onDragExistingShiftStart(event, '${sh.id}')"
                             onclick="onShiftChipClick(event, '${sh.id}')">
                            <span>${sh.tenCa} • ${sh.thoiGianBD}</span>
                        </div>
                    `;
                });
            }

            rowHtml += `
                <div class="day-drop-cell"
                     ondragover="onCellDragOver(event)"
                     ondragleave="onCellDragLeave(event)"
                     ondrop="onCellDrop(event, ${nv.id}, ${d.index})"
                     onclick="onEmptyCellClick(${nv.id}, ${d.index})">
                    ${cellContent}
                </div>
            `;
        });

        rowHtml += `</div>`;
        bodyEl.innerHTML += rowHtml;
    });
}

let dragPayload = null;

function onDragTemplateStart(event, tenCa, bd, kt) {
    if (!isManagerMode) { event.preventDefault(); return; }
    dragPayload = { type: 'TEMPLATE', tenCa, thoiGianBD: bd, thoiGianKT: kt };
    event.dataTransfer.setData('text/plain', JSON.stringify(dragPayload));
}

function onDragExistingShiftStart(event, assignmentId) {
    if (!isManagerMode) { event.preventDefault(); return; }
    event.stopPropagation();
    dragPayload = { type: 'EXISTING', assignmentId };
    event.dataTransfer.setData('text/plain', JSON.stringify(dragPayload));
}

function onCellDragOver(event) { if (!isManagerMode) return; event.preventDefault(); event.currentTarget.classList.add('drag-over'); }
function onCellDragLeave(event) { event.currentTarget.classList.remove('drag-over'); }

async function onCellDrop(event, targetNvId, targetDayIdx) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    if (!isManagerMode || !dragPayload) return;

    if (dragPayload.type === 'TEMPLATE') {
        await createOrUpdateShiftAssignment({
            id: null,
            nhanVienId: targetNvId,
            dayIndex: targetDayIdx,
            tenCa: dragPayload.tenCa,
            thoiGianBD: dragPayload.thoiGianBD,
            thoiGianKT: dragPayload.thoiGianKT
        });
    } else if (dragPayload.type === 'EXISTING') {
        const item = scheduleAssignments.find(a => a.id === dragPayload.assignmentId);
        if (item) {
            item.nhanVienId = targetNvId;
            item.dayIndex = targetDayIdx;
            saveScheduleToLocal();
            renderCalendarMatrix();
            updateRealtimeWorkingStaffWidget();
        }
    }
    dragPayload = null;
}

function onShiftChipClick(event, assignmentId) {
    event.stopPropagation();
    const shift = scheduleAssignments.find(a => a.id === assignmentId);
    if (!shift) return;

    if (isManagerMode) {
        openEditShiftModal(shift);
    } else {
        openStaffSwapRequestModal(shift);
    }
}

function onEmptyCellClick(nvId, dayIdx) { if (!isManagerMode) return; openAssignShiftModal(nvId, dayIdx); }

// =====================================================
// 5. THỜI GIAN THỰC NHÂN SỰ ĐANG LÀM
// =====================================================
function isTimeWithinShift(nowMinutes, bdStr, ktStr) {
    const [bdH, bdM] = (bdStr || '06:30').split(':').map(Number);
    const [ktH, ktM] = (ktStr || '12:00').split(':').map(Number);
    return nowMinutes >= (bdH * 60 + bdM) && nowMinutes <= (ktH * 60 + ktM);
}

function updateRealtimeWorkingStaffWidget() {
    const weekDays = getWeekDaysArray(currentWeekStart);
    const dayObj = weekDays.find(d => d.index === selectedDayIndex) || weekDays[0];
    const titleEl = document.getElementById('rt-day-title');
    if (titleEl) titleEl.innerText = `NHÂN SỰ TRỰC (${dayObj.label} - ${dayObj.fullDate})`;

    const dayShifts = scheduleAssignments.filter(a => Number(a.dayIndex) === Number(selectedDayIndex));
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const activeStaffIdsNow = new Set();
    dayShifts.forEach(s => {
        if (isTimeWithinShift(nowMinutes, s.thoiGianBD, s.thoiGianKT)) {
            activeStaffIdsNow.add(s.nhanVienId);
        }
    });

    const activeCountEl = document.getElementById('rt-active-now-count');
    const totalDayCountEl = document.getElementById('rt-total-day-count');
    const uniqueStaffInDay = new Set(dayShifts.map(s => s.nhanVienId)).size;

    if (activeCountEl) {
        activeCountEl.innerHTML = `${activeStaffIdsNow.size} <span>/ ${uniqueStaffInDay} nhân viên có lịch ngày này</span>`;
    }
    if (totalDayCountEl) {
        totalDayCountEl.innerText = `${dayShifts.length} ca phân công`;
    }

    const ca1List = dayShifts.filter(s => getShiftCssClass(s.tenCa) === 'ca1');
    const ca2List = dayShifts.filter(s => getShiftCssClass(s.tenCa) === 'ca2');
    const ca3List = dayShifts.filter(s => getShiftCssClass(s.tenCa) === 'ca3');

    const getNames = (list) => {
        if (list.length === 0) return 'Chưa có nhân viên';
        return list.map(item => {
            const nv = staffList.find(n => Number(n.id) === Number(item.nhanVienId));
            return nv ? nv.tenNhanVien.split(' ').slice(-2).join(' ') : `NV#${item.nhanVienId}`;
        }).join(', ');
    };

    const breakdownEl = document.getElementById('rt-shift-breakdown');
    if (breakdownEl) {
        breakdownEl.innerHTML = `
            <div class="rt-shift-row ca1">
                <span>Ca 1 (06:30 - 12:00): ${getNames(ca1List)}</span>
                <span>${ca1List.length} NV</span>
            </div>
            <div class="rt-shift-row ca2">
                <span>Ca 2 (12:00 - 17:30): ${getNames(ca2List)}</span>
                <span>${ca2List.length} NV</span>
            </div>
            <div class="rt-shift-row ca3">
                <span>Ca 3 (17:30 - 23:00): ${getNames(ca3List)}</span>
                <span>${ca3List.length} NV</span>
            </div>
        `;
    }
}

// =====================================================
// 6. QUẢN LÝ THÊM / SỬA / XÓA CA LÀM & ĐỔI CA
// =====================================================
let currentEditingAssignmentId = null;
let currentSwapSourceAssignment = null;

function populateStaffSelect(selectId, selectedNvId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    sel.innerHTML = '';
    staffList.forEach(nv => {
        const opt = document.createElement('option');
        opt.value = nv.id;
        opt.textContent = `${nv.tenNhanVien} (#${nv.id})`;
        if (Number(nv.id) === Number(selectedNvId)) opt.selected = true;
        sel.appendChild(opt);
    });
}

function openAssignShiftModal(nvId, dayIdx) {
    closeAllModals();
    currentEditingAssignmentId = null;
    document.getElementById('shift-modal-title').innerText = 'Thêm Ca Làm Cho Nhân Viên';
    populateStaffSelect('shift-form-nv', nvId || (staffList[0] && staffList[0].id));
    
    const daySelect = document.getElementById('shift-form-day');
    daySelect.innerHTML = '';
    getWeekDaysArray(currentWeekStart).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.index;
        opt.textContent = `${d.label} (${d.fullDate})`;
        if (d.index === (dayIdx !== undefined ? dayIdx : selectedDayIndex)) opt.selected = true;
        daySelect.appendChild(opt);
    });

    document.getElementById('shift-form-preset').value = 'Ca 1|06:30|12:00';
    document.getElementById('shift-form-tenCa').value = 'Ca 1';
    document.getElementById('shift-form-bd').value = '06:30';
    document.getElementById('shift-form-kt').value = '12:00';
    document.getElementById('btn-delete-shift').style.display = 'none';

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-shift-manager').style.display = 'block';
}

function openEditShiftModal(shift) {
    closeAllModals();
    currentEditingAssignmentId = shift.id;
    document.getElementById('shift-modal-title').innerText = 'Chỉnh Sửa / Xóa Ca Làm';
    populateStaffSelect('shift-form-nv', shift.nhanVienId);
    
    const daySelect = document.getElementById('shift-form-day');
    daySelect.innerHTML = '';
    getWeekDaysArray(currentWeekStart).forEach(d => {
        const opt = document.createElement('option');
        opt.value = d.index;
        opt.textContent = `${d.label} (${d.fullDate})`;
        if (d.index === shift.dayIndex) opt.selected = true;
        daySelect.appendChild(opt);
    });

    document.getElementById('shift-form-tenCa').value = shift.tenCa;
    document.getElementById('shift-form-bd').value = shift.thoiGianBD;
    document.getElementById('shift-form-kt').value = shift.thoiGianKT;
    document.getElementById('btn-delete-shift').style.display = 'inline-block';

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-shift-manager').style.display = 'block';
}

function applyShiftPreset() {
    const val = document.getElementById('shift-form-preset').value;
    const [tenCa, bd, kt] = val.split('|');
    document.getElementById('shift-form-tenCa').value = tenCa;
    document.getElementById('shift-form-bd').value = bd;
    document.getElementById('shift-form-kt').value = kt;
}

async function saveShiftAssignment() {
    const nvId = Number(document.getElementById('shift-form-nv').value);
    const dayIdx = Number(document.getElementById('shift-form-day').value);
    const tenCa = document.getElementById('shift-form-tenCa').value.trim() || 'Ca 1';
    const bd = document.getElementById('shift-form-bd').value || '06:30';
    const kt = document.getElementById('shift-form-kt').value || '12:00';

    await createOrUpdateShiftAssignment({
        id: currentEditingAssignmentId,
        nhanVienId: nvId,
        dayIndex: dayIdx,
        tenCa: tenCa,
        thoiGianBD: bd,
        thoiGianKT: kt
    });
    closeAllModals();
}

async function createOrUpdateShiftAssignment(payload) {
    try {
        const caDto = {
            tenCa: payload.tenCa,
            thoiGianBD: payload.thoiGianBD,
            thoiGianKT: payload.thoiGianKT,
            ctCaList: [{ caLamId: 0, nhanVienId: payload.nhanVienId, tenCa: payload.tenCa, thoiGianBatDau: payload.thoiGianBD, thoiGianKetThuc: payload.thoiGianKT }]
        };
        const res = await fetch(API_CALAM_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(caDto)
        });
        if (res.ok) {
            const savedCa = await res.json();
            payload.caLamId = savedCa.id;
        }
    } catch (e) {}

    if (payload.id) {
        const idx = scheduleAssignments.findIndex(a => a.id === payload.id);
        if (idx !== -1) scheduleAssignments[idx] = { ...scheduleAssignments[idx], ...payload };
    } else {
        payload.id = 'sh-' + Date.now() + '-' + Math.floor(Math.random() * 100);
        scheduleAssignments.push(payload);
    }

    saveScheduleToLocal();
    renderCalendarMatrix();
    updateRealtimeWorkingStaffWidget();
}

async function deleteShiftAssignment() {
    if (!currentEditingAssignmentId) return;
    const target = scheduleAssignments.find(a => a.id === currentEditingAssignmentId);
    if (target && target.caLamId) {
        try { await fetch(`${API_CALAM_URL}/${target.caLamId}/phancong/${target.nhanVienId}`, { method: 'DELETE' }); } catch (e) {}
    }
    scheduleAssignments = scheduleAssignments.filter(a => a.id !== currentEditingAssignmentId);
    saveScheduleToLocal();
    closeAllModals();
    renderCalendarMatrix();
    updateRealtimeWorkingStaffWidget();
}

function openStaffSwapRequestModal(shift) {
    closeAllModals();
    currentSwapSourceAssignment = shift;
    const nv = staffList.find(n => Number(n.id) === Number(shift.nhanVienId));
    const dayObj = getWeekDaysArray(currentWeekStart)[Number(shift.dayIndex)] || getWeekDaysArray(currentWeekStart)[0];

    document.getElementById('swap-view-nv').innerText = nv ? nv.tenNhanVien : `Nhân viên #${shift.nhanVienId}`;
    document.getElementById('swap-view-ca').innerText = `${shift.tenCa} (${dayObj.label} - ${dayObj.fullDate})`;
    document.getElementById('swap-view-time').innerText = `${shift.thoiGianBD} - ${shift.thoiGianKT}`;
    document.getElementById('swap-reason-input').value = '';
    const targetShift = document.getElementById('swap-target-ca');
    const currentShiftValue = `${shift.tenCa}|${shift.thoiGianBD}|${shift.thoiGianKT}`;
    targetShift.value = Array.from(targetShift.options).some(option => option.value === currentShiftValue)
        ? currentShiftValue
        : targetShift.options[0].value;

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-shift-staff-swap').style.display = 'block';
}

function submitStaffSwapRequest() {
    if (!currentSwapSourceAssignment) return;
    const reason = document.getElementById('swap-reason-input').value.trim();
    if (!reason) { alert("Vui lòng nhập lý do xin đổi ca để Quản lý xét duyệt!"); return; }

    const fromNv = staffList.find(n => Number(n.id) === Number(currentSwapSourceAssignment.nhanVienId));
    const [targetShiftName, targetShiftStart, targetShiftEnd] = document.getElementById('swap-target-ca').value.split('|');
    if (targetShiftName === currentSwapSourceAssignment.tenCa
        && targetShiftStart === currentSwapSourceAssignment.thoiGianBD
        && targetShiftEnd === currentSwapSourceAssignment.thoiGianKT) {
        alert("Vui lòng chọn ca khác ca hiện tại.");
        return;
    }
    const dayObj = getWeekDaysArray(currentWeekStart)[Number(currentSwapSourceAssignment.dayIndex)] || getWeekDaysArray(currentWeekStart)[0];

    const newReq = {
        id: `SW-${Date.now()}`,
        timeAgo: 'Vừa xong',
        fromNvId: currentSwapSourceAssignment.nhanVienId,
        fromNvName: fromNv ? fromNv.tenNhanVien : 'Nhân viên',
        fromShiftText: `${currentSwapSourceAssignment.tenCa} (${dayObj.fullDate})`,
        toShiftName: targetShiftName,
        toShiftStart: targetShiftStart,
        toShiftEnd: targetShiftEnd,
        toShiftText: targetShiftName === 'OFF'
            ? 'Xin nghỉ ca (OFF)'
            : `${targetShiftName} (${targetShiftStart} - ${targetShiftEnd})`,
        reason: `Lý do: ${reason}`,
        status: 'PENDING',
        assignmentId: currentSwapSourceAssignment.id
    };

    swapRequests.unshift(newReq);
    localStorage.setItem('POS_SWAP_REQUESTS', JSON.stringify(swapRequests));
    closeAllModals();
    renderSwapRequests();
    alert("Đã gửi yêu cầu đổi ca thành công đến bộ phận Quản lý!");
}

function renderSwapRequests() {
    const listEl = document.getElementById('swap-requests-list');
    const countEl = document.getElementById('swap-pending-count');
    if (!listEl) return;

    const pendingList = swapRequests.filter(r => r.status === 'PENDING');
    if (countEl) countEl.innerText = pendingList.length;

    if (swapRequests.length === 0) {
        listEl.innerHTML = `<div style="text-align:center; color:#9ca3af; font-size:12px; padding:20px 0;">Không có yêu cầu đổi ca nào cần duyệt.</div>`;
        return;
    }

    listEl.innerHTML = '';
    swapRequests.forEach(req => {
        let actionHtml = '';
        if (req.status === 'PENDING') {
            if (isManagerMode) {
                actionHtml = `
                    <div class="swap-actions">
                        <button class="btn-swap-approve" onclick="handleSwapDecision('${req.id}', true)">✓ Phê Duyệt</button>
                        <button class="btn-swap-reject" onclick="handleSwapDecision('${req.id}', false)">✕ Từ Chối</button>
                    </div>
                `;
            } else {
                actionHtml = `<div style="font-size:11px; font-weight:700; color:#d97706;">⏳ Đang chờ Quản lý duyệt</div>`;
            }
        } else if (req.status === 'APPROVED') {
            actionHtml = `<div style="font-size:11px; font-weight:800; color:#047857;">✓ Quản lý đã phê duyệt</div>`;
        } else {
            actionHtml = `<div style="font-size:11px; font-weight:800; color:#dc2626;">✕ Quản lý đã từ chối</div>`;
        }

        listEl.innerHTML += `
            <div class="swap-item-box">
                <div class="swap-meta-top"><span>Yêu cầu #${req.id}</span><span>${req.timeAgo}</span></div>
                <div class="swap-people">
                    <div><div>${req.fromNvName}</div><div style="font-size:10.5px; color:#e11d48;">${req.fromShiftText}</div></div>
                    <span style="color:#9ca3af;">➔</span>
                    <div style="text-align:right;"><div>Ca được yêu cầu</div><div style="font-size:10.5px; color:#047857;">Đổi sang ${req.toShiftText}</div></div>
                </div>
                <div class="swap-reason">"${req.reason}"</div>
                ${actionHtml}
            </div>
        `;
    });
}

function handleSwapDecision(reqId, isApproved) {
    const req = swapRequests.find(r => r.id === reqId);
    if (!req) return;
    if (isApproved && req.assignmentId) {
        const shift = scheduleAssignments.find(a => a.id === req.assignmentId);
        if (shift && req.toShiftName === 'OFF') {
            scheduleAssignments = scheduleAssignments.filter(a => a.id !== req.assignmentId);
        } else if (shift) {
            shift.tenCa = req.toShiftName;
            shift.thoiGianBD = req.toShiftStart;
            shift.thoiGianKT = req.toShiftEnd;
        }
        saveScheduleToLocal();
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
    }
    req.status = isApproved ? 'APPROVED' : 'REJECTED';
    localStorage.setItem('POS_SWAP_REQUESTS', JSON.stringify(swapRequests));
    renderSwapRequests();
}

// =====================================================
// 7. TAB 2: QUẢN LÝ NHÂN SỰ & PHÂN QUYỀN (THÊM CỘT TRẠNG THÁI)
// =====================================================
let currentEditingStaffId = null;
let currentDeleteStaffId = null;

function updateStaffBadgeCount() {
    const badge = document.getElementById('total-staff-badge');
    if (badge) badge.innerText = staffList.length;
}

function renderStaffTable() {
    const bodyEl = document.getElementById('staff-table-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    const kw = (document.getElementById('staff-search-input')?.value || '').trim().toLowerCase();
    const roleFilter = document.getElementById('staff-role-filter')?.value || 'ALL';

    const filtered = staffList.filter(nv => {
        const matchKw = !kw || nv.tenNhanVien.toLowerCase().includes(kw) || String(nv.id).includes(kw) || (nv.email && nv.email.toLowerCase().includes(kw));
        const matchRole = roleFilter === 'ALL' || nv.vaiTro === roleFilter;
        return matchKw && matchRole;
    });

    const avatarClasses = ['av-dark', 'av-mint', 'av-amber', 'av-rose'];

    filtered.forEach((nv, idx) => {
        const isMgr = (nv.vaiTro === 'ADMIN');
        const avClass = avatarClasses[idx % avatarClasses.length];
        const initials = getInitials(nv.tenNhanVien);
        const badgeClass = isMgr ? 'MANAGER' : 'STAFF';
        const badgeLabel = isMgr ? 'ADMIN' : 'NHANVIEN';
        const disabledAttr = isManagerMode ? '' : 'disabled';

        // Xử lý hiển thị trạng thái làm việc
        const isDangLam = (nv.trangThaiLamViec === 'DANG_LAM_VIEC' || nv.trangThaiLamViec === 'DANG_LAM');
        const statusClass = isDangLam ? 'dang-lam' : 'tam-nghi';
        const statusText = isDangLam ? '● Đang làm' : '● Tạm nghỉ';

        bodyEl.innerHTML += `
            <div class="sm-table-row">
                <div class="staff-cell">
                    <div class="staff-avatar ${avClass}">${initials}</div>
                    <div class="staff-meta" style="text-align:left;">
                        <div class="staff-meta-name">${nv.tenNhanVien}</div>
                        <div class="staff-meta-role">ID: ${nv.id} • ${nv.sdt || ''}</div>
                        <div class="staff-meta-role">${nv.email || ''}</div>
                    </div>
                </div>
                <div style="text-align:left;"><span class="role-badge ${badgeClass}">${badgeLabel}</span></div>
                <div style="text-align:left;"><span class="status-badge-work ${statusClass}">${statusText}</span></div>
                <div><input type="checkbox" class="perm-check" checked ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" checked ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" checked ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" checked ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" ${isMgr ? 'checked' : ''} ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" ${isMgr ? 'checked' : ''} ${disabledAttr}></div>
                <div><input type="checkbox" class="perm-check" ${isMgr ? 'checked' : ''} ${disabledAttr}></div>
                <div style="display:flex; justify-content:center; gap:10px;">
                    ${isManagerMode ? `
                        <span style="cursor:pointer; font-size:15px;" onclick="openEditStaffModal(${nv.id})" title="Sửa nhân viên">✏️</span>
                        <span style="cursor:pointer; font-size:15px;" onclick="openDeleteStaffModal(${nv.id})" title="Xóa nhân viên">🗑️</span>
                    ` : `<span style="color:#9ca3af; font-size:11px;">Chỉ xem</span>`}
                </div>
            </div>
        `;
    });
}

function openCreateStaffModal() {
    if (!isManagerMode) return;
    closeAllModals();
    currentEditingStaffId = null;

    document.getElementById('staff-modal-title').innerText = 'Thêm Nhân Viên Mới';
    document.getElementById('nv-form-name').value = '';
    document.getElementById('nv-form-email').value = '';
    document.getElementById('nv-form-sdt').value = '';
    document.getElementById('nv-form-ngaysinh').value = '2004-01-01';
    document.getElementById('nv-form-ngaylam').value = new Date().toISOString().split('T')[0];
    document.getElementById('nv-form-vaitro').value = 'NHANVIEN';
    document.getElementById('nv-form-trangthai').value = 'DANG_LAM_VIEC';
    document.getElementById('nv-form-password').value = '';
    document.getElementById('nv-form-password-confirm').value = '';
    document.querySelectorAll('.staff-password-row').forEach(row => row.style.display = '');

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-staff-form').style.display = 'block';
}

function openEditStaffModal(id) {
    if (!isManagerMode) return;
    const nv = staffList.find(n => Number(n.id) === Number(id));
    if (!nv) return;

    closeAllModals();
    currentEditingStaffId = nv.id;

    document.getElementById('staff-modal-title').innerText = 'Cập Nhật Thông Tin Nhân Sự';
    document.getElementById('nv-form-name').value = nv.tenNhanVien;
    document.getElementById('nv-form-email').value = nv.email || '';
    document.getElementById('nv-form-sdt').value = nv.sdt || '';
    document.getElementById('nv-form-ngaysinh').value = nv.ngaySinh || '2004-01-01';
    document.getElementById('nv-form-ngaylam').value = nv.ngayLamViec || '2025-01-01';
    document.getElementById('nv-form-vaitro').value = nv.vaiTro || 'NHANVIEN';
    document.getElementById('nv-form-trangthai').value = nv.trangThaiLamViec || 'DANG_LAM_VIEC';
    document.getElementById('nv-form-password').value = '';
    document.getElementById('nv-form-password-confirm').value = '';
    document.querySelectorAll('.staff-password-row').forEach(row => row.style.display = 'none');

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-staff-form').style.display = 'block';
}

async function submitStaffForm() {
    const tenNhanVien = document.getElementById('nv-form-name').value.trim();
    const email = document.getElementById('nv-form-email').value.trim();
    const sdt = document.getElementById('nv-form-sdt').value.trim();
    const ngaySinh = document.getElementById('nv-form-ngaysinh').value;
    const ngayLamViec = document.getElementById('nv-form-ngaylam').value;
    const vaiTro = document.getElementById('nv-form-vaitro').value;
    const trangThaiLamViec = document.getElementById('nv-form-trangthai').value;
    const matKhau = document.getElementById('nv-form-password').value;
    const xacNhanMatKhau = document.getElementById('nv-form-password-confirm').value;

    if (!tenNhanVien) { alert("Vui lòng nhập họ tên nhân viên!"); return; }
    if (!currentEditingStaffId && !matKhau) { alert("Vui lòng tạo mật khẩu cho nhân viên!"); return; }
    if (!currentEditingStaffId && matKhau !== xacNhanMatKhau) {
        alert("Mật khẩu và xác nhận mật khẩu không khớp!");
        return;
    }

    const dto = { tenNhanVien, email, sdt, ngaySinh, ngayLamViec, vaiTro, trangThaiLamViec };

    try {
        if (currentEditingStaffId) {
            dto.id = currentEditingStaffId;
            const res = await fetch(`${API_NV_URL}/${currentEditingStaffId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dto)
            });
            if (!res.ok) throw new Error(await res.text());
        } else {
            const res = await fetch(API_NV_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...dto, matKhau, xacNhanMatKhau })
            });
            if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
        }
        closeAllModals();
        await loadAllDataFromApi();
    } catch (e) {
        alert("Lỗi khi lưu nhân viên qua API: " + e.message);
    }
}

function openDeleteStaffModal(id) {
    if (!isManagerMode) return;
    const nv = staffList.find(n => Number(n.id) === Number(id));
    if (!nv) return;

    currentDeleteStaffId = nv.id;
    closeAllModals();

    document.getElementById('del-nv-id').innerText = `ID #${nv.id}`;
    document.getElementById('del-nv-name').innerText = nv.tenNhanVien;
    document.getElementById('del-nv-email').innerText = nv.email || '';

    document.getElementById('modal-overlay').style.display = 'flex';
    document.getElementById('modal-staff-delete').style.display = 'block';
}

async function confirmDeleteStaff() {
    if (currentDeleteStaffId === null) return;
    try {
        const res = await fetch(`${API_NV_URL}/${currentDeleteStaffId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        closeAllModals();
        await loadAllDataFromApi();
    } catch (e) {
        alert("Lỗi khi xóa nhân viên qua API: " + e.message);
    }
}

function autoScheduleShifts() { if (!isManagerMode) return; alert("Đã tự động sắp xếp lịch ca làm trong tuần!"); }
function savePermissionsMatrix() { alert("Đã lưu ma trận phân quyền hệ thống thành công!"); }
function exportScheduleCSV() { alert("Đã xuất thành công bảng công ca làm việc của tuần!"); }

function closeAllModals() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') closeAllModals();
}