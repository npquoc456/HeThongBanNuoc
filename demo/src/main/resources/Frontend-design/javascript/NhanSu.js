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
    loadScheduleAssignments().then(() => {
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
    }).catch(error => {
        scheduleAssignments = [];
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
        alert("Không thể tải lịch ca: " + error.message);
    });
}

// =====================================================
// 3. TÍCH HỢP REST API NHÂN VIÊN & CA LÀM
// =====================================================
const API_NV_URL = 'http://localhost:8080/api/nhanvien';
const API_CALAM_URL = 'http://localhost:8080/api/calam';
const API_SCHEDULE_URL = 'http://localhost:8080/api/lichca';

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

    try {
        const resCa = await fetch(API_CALAM_URL, { cache: 'no-store' });
        if (!resCa.ok) throw new Error(await resCa.text() || `HTTP ${resCa.status}`);
        const dataCa = await resCa.json();
        if (!Array.isArray(dataCa)) throw new Error("Dữ liệu ca làm không hợp lệ");
        caLamList = dataCa;
        renderShiftTemplates();
    } catch (error) {
        console.error("Không thể tải danh sách ca từ API /api/calam:", error);
        alert("Không thể tải danh sách ca làm từ database: " + error.message);
    }

    try {
        await loadScheduleAssignments();
    } catch (error) {
        scheduleAssignments = [];
        alert("Không thể tải lịch ca từ máy chủ. Hãy kiểm tra migration lịch ca và kết nối backend: " + error.message);
    }

    updateWeekRangeLabel();
    updateStaffBadgeCount();
    renderCalendarHeader();
    renderCalendarMatrix();
    renderSwapRequests();
    updateRealtimeWorkingStaffWidget();
}

async function refreshShiftTemplates() {
    try {
        const response = await fetch(API_CALAM_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Dữ liệu ca làm không hợp lệ");
        caLamList = data;
        renderShiftTemplates();
        updateRealtimeWorkingStaffWidget();
    } catch (error) {
        alert("Không thể làm mới danh sách ca: " + error.message);
    }
}

function normalizeShiftTemplate(template) {
    const normalizeTime = value => {
        const match = /^(\d{1,2}):(\d{2})/.exec(value || '');
        return match ? `${match[1].padStart(2, '0')}:${match[2]}` : '';
    };
    return {
        id: template.id,
        tenCa: template.tenCa || template.name,
        thoiGianBD: normalizeTime(template.thoiGianBD),
        thoiGianKT: normalizeTime(template.thoiGianKT)
    };
}

function renderShiftTemplates() {
    const templateList = document.getElementById('shift-templates-list');
    const presetSelect = document.getElementById('shift-form-preset');
    if (templateList) {
        templateList.replaceChildren();
        caLamList.forEach((rawTemplate, index) => {
            const template = normalizeShiftTemplate(rawTemplate);
            const pill = document.createElement('div');
            pill.className = `shift-template-pill ${['ca1', 'ca2', 'ca3'][index % 3]}`;
            pill.draggable = true;
            pill.textContent = `● ${template.tenCa}: ${template.thoiGianBD} - ${template.thoiGianKT}`;
            pill.addEventListener('dragstart', event => onDragTemplateStart(
                event, template.tenCa, template.thoiGianBD, template.thoiGianKT));
            templateList.appendChild(pill);
        });
        if (caLamList.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'drag-hint';
            empty.textContent = 'Chưa có ca nào trong database.';
            templateList.appendChild(empty);
        }
    }

    if (presetSelect) {
        const previous = presetSelect.value;
        presetSelect.replaceChildren();
        caLamList.forEach(rawTemplate => {
            const template = normalizeShiftTemplate(rawTemplate);
            presetSelect.add(new Option(
                `${template.tenCa}: ${template.thoiGianBD} - ${template.thoiGianKT}`,
                String(template.id)
            ));
        });
        if (caLamList.some(template => String(template.id) === previous)) {
            presetSelect.value = previous;
        }
    }

    const swapSelect = document.getElementById('swap-target-ca');
    if (swapSelect) {
        const offOption = new Option('Xin nghỉ ca (OFF)', 'OFF||');
        swapSelect.replaceChildren();
        caLamList.forEach(rawTemplate => {
            const template = normalizeShiftTemplate(rawTemplate);
            swapSelect.add(new Option(
                `${template.tenCa} (${template.thoiGianBD} - ${template.thoiGianKT})`,
                JSON.stringify([template.tenCa, template.thoiGianBD, template.thoiGianKT])
            ));
        });
        swapSelect.add(offOption);
    }
}

async function loadScheduleAssignments() {
    const days = getWeekDaysArray(currentWeekStart);
    const startDate = toLocalDateString(days[0].dateObj);
    const endDate = toLocalDateString(days[6].dateObj);
    const response = await fetch(`${API_SCHEDULE_URL}?startDate=${startDate}&endDate=${endDate}`);
    if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Dữ liệu lịch ca không hợp lệ");
    scheduleAssignments = data.map(mapScheduleDto);
}

function toLocalDateString(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function mapScheduleDto(dto) {
    const scheduledDate = new Date(`${dto.ngayLam}T00:00:00`);
    const dayIndex = Math.round((scheduledDate - getWeekDaysArray(currentWeekStart)[0].dateObj) / 86400000);
    return {
        id: dto.id,
        nhanVienId: dto.nhanVienId,
        tenNhanVien: dto.tenNhanVien,
        dayIndex,
        ngayLam: dto.ngayLam,
        tenCa: dto.tenCa,
        thoiGianBD: dto.thoiGianBD,
        thoiGianKT: dto.thoiGianKT
    };
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
    const templateIndex = caLamList.findIndex(template => template.tenCa === tenCa);
    if (templateIndex >= 0) return ['ca1', 'ca2', 'ca3'][templateIndex % 3];
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
        const item = scheduleAssignments.find(a => String(a.id) === String(dragPayload.assignmentId));
        if (item) {
            await createOrUpdateShiftAssignment({
                ...item,
                nhanVienId: targetNvId,
                dayIndex: targetDayIdx
            });
        }
    }
    dragPayload = null;
}

function onShiftChipClick(event, assignmentId) {
    event.stopPropagation();
    const shift = scheduleAssignments.find(a => String(a.id) === String(assignmentId));
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

    const getNames = (list) => {
        if (list.length === 0) return 'Chưa có nhân viên';
        return list.map(item => {
            const nv = staffList.find(n => Number(n.id) === Number(item.nhanVienId));
            return nv ? nv.tenNhanVien.split(' ').slice(-2).join(' ') : `NV#${item.nhanVienId}`;
        }).join(', ');
    };

    const breakdownEl = document.getElementById('rt-shift-breakdown');
    if (breakdownEl) {
        const templates = caLamList.map(normalizeShiftTemplate);
        const renderedKeys = new Set();
        const rows = templates.map(template => {
            const key = `${template.tenCa}|${template.thoiGianBD}|${template.thoiGianKT}`;
            renderedKeys.add(key);
            const matchingShifts = dayShifts.filter(shift =>
                shift.tenCa === template.tenCa
                && shift.thoiGianBD === template.thoiGianBD
                && shift.thoiGianKT === template.thoiGianKT);
            return `<div class="rt-shift-row ${getShiftCssClass(template.tenCa)}">
                <span>${template.tenCa} (${template.thoiGianBD} - ${template.thoiGianKT}): ${getNames(matchingShifts)}</span>
                <span>${matchingShifts.length} NV</span>
            </div>`;
        });
        const extraShifts = [...new Map(dayShifts
            .map(shift => [`${shift.tenCa}|${shift.thoiGianBD}|${shift.thoiGianKT}`, shift])).values()]
            .filter(shift => !renderedKeys.has(`${shift.tenCa}|${shift.thoiGianBD}|${shift.thoiGianKT}`));
        extraShifts.forEach(template => {
            const matchingShifts = dayShifts.filter(shift =>
                shift.tenCa === template.tenCa
                && shift.thoiGianBD === template.thoiGianBD
                && shift.thoiGianKT === template.thoiGianKT);
            rows.push(`<div class="rt-shift-row ${getShiftCssClass(template.tenCa)}">
                <span>${template.tenCa} (${template.thoiGianBD} - ${template.thoiGianKT}): ${getNames(matchingShifts)}</span>
                <span>${matchingShifts.length} NV</span>
            </div>`);
        });
        breakdownEl.innerHTML = rows.join('');
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

    renderShiftTemplates();
    const firstTemplate = caLamList[0] ? normalizeShiftTemplate(caLamList[0]) : null;
    document.getElementById('shift-form-preset').value = firstTemplate ? String(firstTemplate.id) : '';
    document.getElementById('shift-form-tenCa').value = firstTemplate ? firstTemplate.tenCa : '';
    document.getElementById('shift-form-bd').value = firstTemplate ? firstTemplate.thoiGianBD : '';
    document.getElementById('shift-form-kt').value = firstTemplate ? firstTemplate.thoiGianKT : '';
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
    const id = document.getElementById('shift-form-preset').value;
    const template = caLamList.find(item => String(item.id) === id);
    if (!template) return;
    const shift = normalizeShiftTemplate(template);
    document.getElementById('shift-form-tenCa').value = shift.tenCa;
    document.getElementById('shift-form-bd').value = shift.thoiGianBD;
    document.getElementById('shift-form-kt').value = shift.thoiGianKT;
}

async function saveShiftAssignment() {
    const nvId = Number(document.getElementById('shift-form-nv').value);
    const dayIdx = Number(document.getElementById('shift-form-day').value);
    const tenCa = document.getElementById('shift-form-tenCa').value.trim();
    const bd = document.getElementById('shift-form-bd').value;
    const kt = document.getElementById('shift-form-kt').value;
    if (!tenCa || !bd || !kt) {
        alert("Vui lòng chọn ca mẫu hoặc nhập đầy đủ tên ca và thời gian.");
        return;
    }

    const saved = await createOrUpdateShiftAssignment({
        id: currentEditingAssignmentId,
        nhanVienId: nvId,
        dayIndex: dayIdx,
        tenCa: tenCa,
        thoiGianBD: bd,
        thoiGianKT: kt
    });
    if (saved) closeAllModals();
}

async function createOrUpdateShiftAssignment(payload) {
    try {
        const body = {
            nhanVienId: payload.nhanVienId,
            ngayLam: toLocalDateString(getWeekDaysArray(currentWeekStart)[payload.dayIndex].dateObj),
            tenCa: payload.tenCa,
            thoiGianBD: payload.thoiGianBD,
            thoiGianKT: payload.thoiGianKT
        };
        const isUpdate = payload.id !== null && payload.id !== undefined;
        const res = await fetch(isUpdate ? `${API_SCHEDULE_URL}/${payload.id}` : API_SCHEDULE_URL, {
            method: isUpdate ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`);
        const saved = mapScheduleDto(await res.json());
        const idx = scheduleAssignments.findIndex(a => String(a.id) === String(saved.id));
        if (idx === -1) scheduleAssignments.push(saved);
        else scheduleAssignments[idx] = saved;
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
        return true;
    } catch (error) {
        alert("Lỗi khi lưu lịch ca: " + error.message);
        return false;
    }
}

async function deleteShiftAssignment() {
    if (!currentEditingAssignmentId) return;
    try {
        const response = await fetch(`${API_SCHEDULE_URL}/${currentEditingAssignmentId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
        scheduleAssignments = scheduleAssignments.filter(a => String(a.id) !== String(currentEditingAssignmentId));
        closeAllModals();
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
    } catch (error) {
        alert("Lỗi khi xóa lịch ca: " + error.message);
    }
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
    const currentShiftValue = JSON.stringify([shift.tenCa, shift.thoiGianBD, shift.thoiGianKT]);
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
    let targetShiftName;
    let targetShiftStart;
    let targetShiftEnd;
    try {
        [targetShiftName, targetShiftStart, targetShiftEnd] = JSON.parse(
            document.getElementById('swap-target-ca').value);
    } catch (error) {
        [targetShiftName, targetShiftStart, targetShiftEnd] = ['OFF', '', ''];
    }
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

async function handleSwapDecision(reqId, isApproved) {
    const req = swapRequests.find(r => r.id === reqId);
    if (!req) return;
    if (isApproved && req.assignmentId) {
        const shift = scheduleAssignments.find(a => String(a.id) === String(req.assignmentId));
        if (shift && req.toShiftName === 'OFF') {
            try {
                const response = await fetch(`${API_SCHEDULE_URL}/${shift.id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
                scheduleAssignments = scheduleAssignments.filter(a => String(a.id) !== String(shift.id));
            } catch (error) {
                alert("Không thể cập nhật lịch đổi ca: " + error.message);
                return;
            }
        } else if (shift) {
            const saved = await createOrUpdateShiftAssignment({
                ...shift,
                tenCa: req.toShiftName,
                thoiGianBD: req.toShiftStart,
                thoiGianKT: req.toShiftEnd
            });
            if (!saved) return;
        }
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

async function autoScheduleShifts() {
    if (!isManagerMode) return;

    const activeStaff = staffList.filter(nv => nv.trangThaiLamViec === 'DANG_LAM_VIEC');
    if (activeStaff.length === 0) {
        alert("Không có nhân viên đang làm việc để xếp lịch.");
        return;
    }

    const templates = caLamList.map(normalizeShiftTemplate);
    if (templates.length === 0) {
        alert("Chưa có khung ca nào trong database để xếp tự động.");
        return;
    }
    const workedDays = new Map(activeStaff.map(nv => [Number(nv.id), new Set()]));
    const assignedByDay = new Map();
    scheduleAssignments.forEach(shift => {
        const employeeId = Number(shift.nhanVienId);
        if (!workedDays.has(employeeId)) return;
        workedDays.get(employeeId).add(Number(shift.dayIndex));
        if (!assignedByDay.has(Number(shift.dayIndex))) assignedByDay.set(Number(shift.dayIndex), new Set());
        assignedByDay.get(Number(shift.dayIndex)).add(employeeId);
    });

    const newAssignments = [];
    const shiftCounts = new Map(templates.map(template => [template.tenCa,
        scheduleAssignments.filter(shift => shift.tenCa === template.tenCa).length]));

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const assignedToday = assignedByDay.get(dayIndex) || new Set();
        const candidates = activeStaff
            .filter(nv => !assignedToday.has(Number(nv.id)) && workedDays.get(Number(nv.id)).size < 6)
            .sort((a, b) => workedDays.get(Number(a.id)).size - workedDays.get(Number(b.id)).size
                || Number(a.id) - Number(b.id));

        for (const employee of candidates) {
            const template = [...templates].sort((a, b) =>
                shiftCounts.get(a.tenCa) - shiftCounts.get(b.tenCa)
                || ((templates.indexOf(a) - dayIndex + templates.length) % templates.length)
                    - ((templates.indexOf(b) - dayIndex + templates.length) % templates.length))[0];
            newAssignments.push({
                nhanVienId: Number(employee.id),
                ngayLam: toLocalDateString(getWeekDaysArray(currentWeekStart)[dayIndex].dateObj),
                tenCa: template.tenCa,
                thoiGianBD: template.thoiGianBD,
                thoiGianKT: template.thoiGianKT
            });
            workedDays.get(Number(employee.id)).add(dayIndex);
            assignedToday.add(Number(employee.id));
            shiftCounts.set(template.tenCa, shiftCounts.get(template.tenCa) + 1);
        }
        assignedByDay.set(dayIndex, assignedToday);
    }

    if (newAssignments.length === 0) {
        alert("Không còn ô trống phù hợp để xếp lịch. Lịch hiện tại được giữ nguyên.");
        return;
    }

    try {
        const response = await fetch(`${API_SCHEDULE_URL}/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newAssignments)
        });
        if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`);
        await loadScheduleAssignments();
        renderCalendarMatrix();
        updateRealtimeWorkingStaffWidget();
        alert(`Đã xếp thêm ${newAssignments.length} ca. Ca đã có được giữ nguyên; mỗi nhân viên được xếp tối đa 6 ngày và 1 ca/ngày.`);
    } catch (error) {
        alert("Không thể xếp lịch tự động: " + error.message);
    }
}
function savePermissionsMatrix() { alert("Đã lưu ma trận phân quyền hệ thống thành công!"); }
function exportScheduleCSV() {
    const days = getWeekDaysArray(currentWeekStart);
    const rows = [['Nhân viên', 'Ngày', 'Ca', 'Bắt đầu', 'Kết thúc', 'Giờ dự kiến']];
    const sorted = [...scheduleAssignments].sort((a, b) =>
        a.dayIndex - b.dayIndex || a.thoiGianBD.localeCompare(b.thoiGianBD));

    sorted.forEach(shift => {
        const employee = staffList.find(nv => Number(nv.id) === Number(shift.nhanVienId));
        const [startHour, startMinute] = shift.thoiGianBD.split(':').map(Number);
        const [endHour, endMinute] = shift.thoiGianKT.split(':').map(Number);
        let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
        if (minutes < 0) minutes += 24 * 60;
        rows.push([
            employee ? employee.tenNhanVien : `Nhân viên #${shift.nhanVienId}`,
            toLocalDateString(days[shift.dayIndex].dateObj),
            shift.tenCa,
            shift.thoiGianBD,
            shift.thoiGianKT,
            (minutes / 60).toFixed(2)
        ]);
    });

    const csv = '\uFEFF' + rows.map(row => row.map(value =>
        `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bang-cong-ca-du-kien-${toLocalDateString(days[0].dateObj)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function closeAllModals() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.style.display = 'none';
    document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
}

function closeModalOnOutsideClick(event) {
    if (event.target.id === 'modal-overlay') closeAllModals();
}