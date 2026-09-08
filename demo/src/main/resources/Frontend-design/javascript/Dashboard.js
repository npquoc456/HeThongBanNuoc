/* =========================================================
   DASHBOARD.JS

   - 7 ngày gần nhất
   - Cột = số lượng bán
   - Đường = doanh thu
   - Top 5 sản phẩm
   - Widget doanh thu
   - Widget tăng trưởng
   - Đồng hồ
   - Thời tiết

   Không sử dụng Chart.js.
   ========================================================= */


/* =========================================================
   BIẾN TOÀN CỤC
   ========================================================= */

let idnhanviendangnhap =
    localStorage.getItem(
        "POS_STAFF_ID"
    );


let tennhanviendangnhap =
    localStorage.getItem(
        "POS_STAFF_NAME"
    ) || "Nhân Viên";


let dashboardLoading =
    false;


let lastDashboardData =
    null;


/* =========================================================
   API
   ========================================================= */

const API_BASE =
    "http://localhost:8080/api/dashboard";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "======================================"
        );

        console.log(
            "Dashboard.js loaded"
        );

        console.log(
            "======================================"
        );


        /* =================================================
           LOGIN
           ================================================= */

        if (!idnhanviendangnhap) {

            alert(
                "Vui lòng đăng nhập trước khi sử dụng hệ thống!"
            );


            if (window.javaBackend) {

                window.javaBackend.loadTrang(
                    "Login.html"
                );

            } else {

                window.location.href =
                    "Login.html";
            }


            return;
        }


        /* =================================================
           STAFF
           ================================================= */

        const staffId =
            document.getElementById(
                "staffid"
            );


        const staffName =
            document.getElementById(
                "staffname"
            );


        if (staffId) {

            staffId.innerText =
                idnhanviendangnhap;
        }


        if (staffName) {

            staffName.innerText =
                tennhanviendangnhap;
        }


        /* =================================================
           CLOCK
           ================================================= */

        updateClocks();


        setInterval(
            updateClocks,
            1000
        );


        /* =================================================
           WEATHER
           ================================================= */

        getRealTimeWeather();


        /* =================================================
           LOAD DATA
           ================================================= */

        setTimeout(
            function () {

                fetchDashboardData();

            },
            200
        );


        /* =================================================
           AUTO REFRESH
           ================================================= */

        setInterval(
            function () {

                fetchDashboardData();

            },
            10000
        );
    }
);


/* =========================================================
   SCALE
   ========================================================= */

function scaleApp() {

    const wrapper =
        document.getElementById(
            "app-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const viewportWidth =
        window.innerWidth;


    const viewportHeight =
        window.innerHeight;


    const scale =
        Math.min(
            viewportWidth / 1440,
            viewportHeight / 1080
        );


    wrapper.style.transform =
        `scale(${scale})`;
}


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    function () {

        scaleApp();


        /*
         * Không gọi API khi resize.
         */

        if (
            lastDashboardData
        ) {

            setTimeout(
                redrawDashboardCharts,
                50
            );
        }
    }
);


/* =========================================================
   INITIAL SCALE
   ========================================================= */

scaleApp();


/* =========================================================
   CHUYỂN TRANG
   ========================================================= */

function chuyentrang(trang) {

    if (window.javaBackend) {

        window.javaBackend.loadTrang(
            trang
        );

    } else {

        window.location.href =
            trang;
    }
}


/* =========================================================
   CLOCK
   ========================================================= */

function updateClocks() {

    const now =
        new Date();


    /* =====================================================
       VIỆT NAM
       ===================================================== */

    const vnDays =
        [
            "Chủ Nhật",
            "Thứ Hai",
            "Thứ Ba",
            "Thứ Tư",
            "Thứ Năm",
            "Thứ Sáu",
            "Thứ Bảy"
        ];


    const dateString =
        `${vnDays[now.getDay()]}, ` +
        `${now.getDate()} tháng ` +
        `${now.getMonth() + 1}, ` +
        `${now.getFullYear()}`;


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    const fullTime =
        `${hours}:${minutes}:${seconds}`;


    const currentDateEl =
        document.getElementById(
            "current-date"
        );


    const currentTimeEl =
        document.getElementById(
            "current-time"
        );


    if (
        currentDateEl
    ) {

        currentDateEl.innerText =
            dateString;
    }


    if (
        currentTimeEl
    ) {

        currentTimeEl.innerText =
            fullTime;
    }


    /* =====================================================
       ENGLISH CLOCK
       ===================================================== */

    const enDays =
        [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];


    const enMonths =
        [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];


    const widgetDateEl =
        document.getElementById(
            "widget-date"
        );


    if (
        widgetDateEl
    ) {

        widgetDateEl.innerText =
            `${enDays[now.getDay()]}, ` +
            `${enMonths[now.getMonth()]} ` +
            `${now.getDate()}`;
    }


    /* =====================================================
       12H FORMAT
       ===================================================== */

    let widgetHours =
        now.getHours();


    const widgetMinutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const ampm =
        widgetHours >= 12
            ? "P.M"
            : "A.M";


    widgetHours =
        widgetHours % 12;


    if (
        widgetHours === 0
    ) {

        widgetHours =
            12;
    }


    const widgetTimeEl =
        document.getElementById(
            "widget-time"
        );


    const widgetAmpmEl =
        document.getElementById(
            "widget-ampm"
        );


    if (
        widgetTimeEl
    ) {

        widgetTimeEl.innerText =
            `${widgetHours}:${widgetMinutes}`;
    }


    if (
        widgetAmpmEl
    ) {

        widgetAmpmEl.innerText =
            ampm;
    }
}


/* =========================================================
   WEATHER
   ========================================================= */

async function getRealTimeWeather() {

    const tempEl =
        document.getElementById(
            "weather-temp"
        );


    try {

        const url =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=10.823" +
            "&longitude=106.6296" +
            "&current_weather=true";


        const response =
            await fetch(
                url
            );


        if (!response.ok) {

            throw new Error(
                "Weather HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        if (
            tempEl &&
            data.current_weather
        ) {

            const temperature =
                Number(
                    data
                        .current_weather
                        .temperature
                );


            tempEl.innerText =
                Math.round(
                    temperature
                ) +
                "°C";
        }


    } catch (error) {

        console.warn(
            "Không thể lấy thời tiết:",
            error
        );


        if (tempEl) {

            tempEl.innerText =
                "28°C";
        }
    }
}


/* =========================================================
   FETCH DASHBOARD
   ========================================================= */

async function fetchDashboardData() {

    if (
        dashboardLoading
    ) {
        return;
    }


    dashboardLoading =
        true;


    try {

        console.log(
            "Đang lấy dữ liệu Dashboard..."
        );


        const response =
            await fetch(
                API_BASE,
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        console.log(
            "Dashboard status:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "Dashboard data:",
            data
        );


        /*
         * Lưu data.
         */

        lastDashboardData =
            data;


        /* =================================================
           DOANH THU
           ================================================= */

        const currentRevenue =
            toNumber(
                data.doanhThuTuanNay
            );


        const previousRevenue =
            toNumber(
                data.doanhThuTuanTruoc
            );


        /* =================================================
           GROWTH
           ================================================= */

        let growth =
            toNumber(
                data.tangTruongDoanhThu
            );


        if (
            data.tangTruongDoanhThu ===
            undefined
            ||
            data.tangTruongDoanhThu ===
            null
        ) {

            growth =
                calculateGrowth(
                    currentRevenue,
                    previousRevenue
                );
        }


        /* =================================================
           LABEL
           ================================================= */

        const labels =
            normalizeLabels(
                data.labels
            );


        /* =================================================
           QUANTITY
           ================================================= */

        const quantities =
            normalizeSevenValues(
                data.bieuDoSoLuongTheoTuan
            );


        /* =================================================
           REVENUE
           ================================================= */

        const revenues =
            normalizeSevenValues(
                data.bieuDoDoanhThuTheoTuan
            );


        /* =================================================
           TOP 5
           ================================================= */

        const topProducts =
            normalizeTopProducts(
                data.topSanPhamBanChay
            );


        /* =================================================
           GROWTH WIDGET
           ================================================= */

        const growthEl =
            document.getElementById(
                "growth-value"
            );


        if (growthEl) {

            growthEl.innerText =
                formatNumber(
                    Math.round(
                        growth
                    )
                );
        }


        /* =================================================
           DRAW REVENUE
           ================================================= */

        drawRevenueDoughnut(
            currentRevenue,
            previousRevenue
        );


        /* =================================================
           DRAW MAIN CHART
           ================================================= */

        drawWeeklyChart(
            labels,
            quantities,
            revenues
        );


        /* =================================================
           DRAW TOP PRODUCTS
           ================================================= */

        drawTopProducts(
            topProducts
        );


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        /*
         * Vẫn vẽ giao diện chart sáng
         * khi API gặp lỗi.
         */

        drawRevenueDoughnut(
            0,
            0
        );


        drawWeeklyChart(
            createFallbackLabels(),
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ],
            [
                0,
                0,
                0,
                0,
                0,
                0,
                0
            ]
        );


        drawTopProducts(
            []
        );


    } finally {

        dashboardLoading =
            false;
    }
}


/* =========================================================
   REDRAW
   ========================================================= */

function redrawDashboardCharts() {

    if (
        !lastDashboardData
    ) {
        return;
    }


    const data =
        lastDashboardData;


    const labels =
        normalizeLabels(
            data.labels
        );


    const quantities =
        normalizeSevenValues(
            data.bieuDoSoLuongTheoTuan
        );


    const revenues =
        normalizeSevenValues(
            data.bieuDoDoanhThuTheoTuan
        );


    const topProducts =
        normalizeTopProducts(
            data.topSanPhamBanChay
        );


    drawRevenueDoughnut(
        toNumber(
            data.doanhThuTuanNay
        ),
        toNumber(
            data.doanhThuTuanTruoc
        )
    );


    drawWeeklyChart(
        labels,
        quantities,
        revenues
    );


    drawTopProducts(
        topProducts
    );
}


/* =========================================================
   PREPARE CANVAS
   ========================================================= */

function prepareCanvas(
    canvas
) {

    if (!canvas) {
        return null;
    }


    /*
     * clientWidth/clientHeight
     *
     * Không dùng getBoundingClientRect()
     * vì app có transform: scale().
     */

    let width =
        canvas.clientWidth;


    let height =
        canvas.clientHeight;


    /* =====================================================
       FALLBACK
       ===================================================== */

    if (
        width <= 0
        &&
        canvas.parentElement
    ) {

        width =
            canvas.parentElement.clientWidth;
    }


    if (
        height <= 0
        &&
        canvas.parentElement
    ) {

        height =
            canvas.parentElement.clientHeight;
    }


    width =
        Math.max(
            Math.floor(width),
            100
        );


    height =
        Math.max(
            Math.floor(height),
            100
        );


    const dpr =
        window.devicePixelRatio || 1;


    /*
     * Kích thước thật.
     */

    canvas.width =
        Math.floor(
            width * dpr
        );


    canvas.height =
        Math.floor(
            height * dpr
        );


    /*
     * Kích thước CSS.
     */

    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {
        return null;
    }


    /*
     * Reset transform.
     */

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
     * Reset state.
     */

    ctx.globalAlpha =
        1;


    ctx.globalCompositeOperation =
        "source-over";


    return {

        ctx:
            ctx,

        width:
            width,

        height:
            height
    };
}


/* =========================================================
   REVENUE DOUGHNUT
   ========================================================= */

function drawRevenueDoughnut(
    currentRevenue,
    previousRevenue
) {

    const canvas =
        document.getElementById(
            "revenueDoughnut"
        );


    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const ctx =
        prepared.ctx;


    const width =
        prepared.width;


    const height =
        prepared.height;


    /*
     * Reset.
     */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const current =
        Math.max(
            toNumber(
                currentRevenue
            ),
            0
        );


    const previous =
        Math.max(
            toNumber(
                previousRevenue
            ),
            0
        );


    const total =
        current +
        previous;


    const centerX =
        width / 2;


    const centerY =
        height / 2;


    /*
     * Độ dày vừa phải.
     */

    const lineWidth =
        18;


    /*
     * Radius luôn nằm trong canvas.
     */

    const radius =
        Math.max(
            1,
            Math.min(
                width,
                height
            ) /
            2 -
            lineWidth / 2 -
            5
        );


    /*
     * Không có data.
     */

    if (
        total <= 0
    ) {

        drawDonutArc(
            ctx,
            centerX,
            centerY,
            radius,
            lineWidth,
            0,
            Math.PI * 2,
            "#E0E0E0"
        );


        return;
    }


    /*
     * Start ở 12 giờ.
     */

    let startAngle =
        -Math.PI / 2;


    /*
     * Current.
     */

    const currentAngle =
        current /
        total *
        Math.PI *
        2;


    if (
        currentAngle > 0
    ) {

        drawDonutArc(
            ctx,
            centerX,
            centerY,
            radius,
            lineWidth,
            startAngle,
            startAngle +
                currentAngle,
            "#555555"
        );
    }


    startAngle +=
        currentAngle;


    /*
     * Previous.
     */

    const previousAngle =
        previous /
        total *
        Math.PI *
        2;


    if (
        previousAngle > 0
    ) {

        drawDonutArc(
            ctx,
            centerX,
            centerY,
            radius,
            lineWidth,
            startAngle,
            startAngle +
                previousAngle,
            "#E0E0E0"
        );
    }
}


/* =========================================================
   DRAW DONUT ARC
   ========================================================= */

function drawDonutArc(
    ctx,
    centerX,
    centerY,
    radius,
    lineWidth,
    startAngle,
    endAngle,
    color
) {

    ctx.beginPath();


    ctx.arc(
        centerX,
        centerY,
        radius,
        startAngle,
        endAngle
    );


    ctx.lineWidth =
        lineWidth;


    ctx.lineCap =
        "butt";


    ctx.strokeStyle =
        color;


    ctx.globalAlpha =
        1;


    ctx.stroke();
}


/* =========================================================
   MAIN WEEKLY CHART
   =========================================================

   BAR:
       Số lượng

   LINE:
       Doanh thu
   ========================================================= */

function drawWeeklyChart(
    labels,
    quantities,
    revenues
) {

    const canvas =
        document.getElementById(
            "weeklySalesChart"
        );


    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const ctx =
        prepared.ctx;


    const width =
        prepared.width;


    const height =
        prepared.height;


    /*
     * Reset canvas.
     */

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /*
     * =====================================================
     * FIX NỀN ĐEN
     * =====================================================
     *
     * Tô nền trực tiếp lên canvas bằng màu OPAQUE.
     */

    ctx.globalAlpha =
        1;


    ctx.globalCompositeOperation =
        "source-over";


    ctx.fillStyle =
        "#f5f5f5";


    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /* =====================================================
       DATA
       ===================================================== */

    const safeLabels =
        normalizeLabels(
            labels
        );


    const safeQuantities =
        normalizeSevenValues(
            quantities
        );


    const safeRevenues =
        normalizeSevenValues(
            revenues
        );


    /* =====================================================
       CHART AREA
       ===================================================== */

    const left =
        48;


    const right =
        70;


    const top =
        18;


    const bottom =
        42;


    const chartWidth =
        Math.max(
            width -
            left -
            right,
            100
        );


    const chartHeight =
        Math.max(
            height -
            top -
            bottom,
            100
        );


    /* =====================================================
       MAX QUANTITY
       ===================================================== */

    const rawMaxQuantity =
        Math.max(
            ...safeQuantities,
            0
        );


    let maxQuantity;


    if (
        rawMaxQuantity <= 10
    ) {

        maxQuantity =
            10;

    } else {

        maxQuantity =
            Math.ceil(
                rawMaxQuantity / 10
            ) *
            10;
    }


    /* =====================================================
       MAX REVENUE
       ===================================================== */

    const rawMaxRevenue =
        Math.max(
            ...safeRevenues,
            0
        );


    let maxRevenue;


    if (
        rawMaxRevenue <= 100000
    ) {

        maxRevenue =
            100000;

    } else {

        maxRevenue =
            Math.ceil(
                rawMaxRevenue / 100000
            ) *
            100000;
    }


    /* =====================================================
       GRID
       ===================================================== */

    const gridCount =
        5;


    for (
        let i = 0;
        i <= gridCount;
        i++
    ) {

        const ratio =
            i /
            gridCount;


        const y =
            top +
            chartHeight -
            ratio *
            chartHeight;


        /*
         * Grid line.
         */

        ctx.beginPath();


        ctx.moveTo(
            left,
            y
        );


        ctx.lineTo(
            width -
            right,
            y
        );


        ctx.lineWidth =
            1;


        ctx.strokeStyle =
            "rgba(0,0,0,0.08)";


        ctx.stroke();


        /*
         * Quantity axis.
         */

        const quantityValue =
            Math.round(
                ratio *
                maxQuantity
            );


        ctx.font =
            "12px Segoe UI";


        ctx.fillStyle =
            "#555555";


        ctx.textAlign =
            "right";


        ctx.textBaseline =
            "middle";


        ctx.fillText(
            formatNumber(
                quantityValue
            ),
            left - 10,
            y
        );


        /*
         * Revenue axis.
         */

        const revenueValue =
            ratio *
            maxRevenue;


        ctx.textAlign =
            "left";


        ctx.fillText(
            formatRevenueAxis(
                revenueValue
            ),
            width -
                right +
                8,
            y
        );
    }


    /* =====================================================
       AXIS
       ===================================================== */

    ctx.strokeStyle =
        "#222222";


    ctx.lineWidth =
        2;


    /*
     * Y axis.
     */

    ctx.beginPath();


    ctx.moveTo(
        left,
        top
    );


    ctx.lineTo(
        left,
        top +
        chartHeight
    );


    ctx.stroke();


    /*
     * X axis.
     */

    ctx.beginPath();


    ctx.moveTo(
        left,
        top +
        chartHeight
    );


    ctx.lineTo(
        width -
        right,
        top +
        chartHeight
    );


    ctx.stroke();


    /* =====================================================
       7 NGÀY
       ===================================================== */

    const dayCount =
        7;


    const step =
        chartWidth /
        dayCount;


    const barWidth =
        Math.min(
            32,
            step *
            0.42
        );


    /* =====================================================
       CỘT
       ===================================================== */

    for (
        let i = 0;
        i < dayCount;
        i++
    ) {

        const quantity =
            safeQuantities[i];


        const barHeight =
            quantity /
            maxQuantity *
            chartHeight;


        const centerX =
            left +
            step * i +
            step / 2;


        const x =
            centerX -
            barWidth / 2;


        const y =
            top +
            chartHeight -
            barHeight;


        /*
         * Column.
         */

        ctx.fillStyle =
            "#AEB6C7";


        ctx.fillRect(
            x,
            y,
            barWidth,
            barHeight
        );


        /*
         * Quantity label.
         */

        if (
            quantity > 0
        ) {

            ctx.fillStyle =
                "#444444";


            ctx.font =
                "bold 11px Segoe UI";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "bottom";


            ctx.fillText(
                formatNumber(
                    quantity
                ),
                centerX,
                y - 5
            );
        }
    }


    /* =====================================================
       ĐƯỜNG DOANH THU
       ===================================================== */

    ctx.beginPath();


    for (
        let i = 0;
        i < dayCount;
        i++
    ) {

        const revenue =
            safeRevenues[i];


        const centerX =
            left +
            step * i +
            step / 2;


        const y =
            top +
            chartHeight -
            revenue /
            maxRevenue *
            chartHeight;


        if (
            i === 0
        ) {

            ctx.moveTo(
                centerX,
                y
            );

        } else {

            ctx.lineTo(
                centerX,
                y
            );
        }
    }


    ctx.strokeStyle =
        "#2962FF";


    ctx.lineWidth =
        2.5;


    ctx.lineJoin =
        "round";


    ctx.lineCap =
        "round";


    ctx.stroke();


    /* =====================================================
       POINTS + REVENUE LABEL
       ===================================================== */

    for (
        let i = 0;
        i < dayCount;
        i++
    ) {

        const revenue =
            safeRevenues[i];


        const centerX =
            left +
            step * i +
            step / 2;


        const y =
            top +
            chartHeight -
            revenue /
            maxRevenue *
            chartHeight;


        /* =================================================
           POINT
           ================================================= */

        ctx.beginPath();


        ctx.arc(
            centerX,
            y,
            3,
            0,
            Math.PI * 2
        );


        ctx.fillStyle =
            "#2962FF";


        ctx.fill();


        /* =================================================
           REVENUE VALUE
           ================================================= */

        if (
            revenue > 0
        ) {

            ctx.fillStyle =
                "#2962FF";


            ctx.font =
                "bold 10px Segoe UI";


            ctx.textAlign =
                "center";


            let labelY =
                y - 7;


            /*
             * Nếu gần đỉnh chart,
             * đưa chữ xuống dưới point.
             */

            if (
                labelY <
                top + 10
            ) {

                ctx.textBaseline =
                    "top";


                labelY =
                    y + 7;

            } else {

                ctx.textBaseline =
                    "bottom";
            }


            ctx.fillText(
                formatRevenueAxis(
                    revenue
                ),
                centerX,
                labelY
            );
        }
    }


    /* =====================================================
       DATE LABEL
       ===================================================== */

    ctx.fillStyle =
        "#222222";


    ctx.font =
        "bold 12px Segoe UI";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "top";


    for (
        let i = 0;
        i < dayCount;
        i++
    ) {

        const centerX =
            left +
            step * i +
            step / 2;


        ctx.fillText(
            safeLabels[i],
            centerX,
            top +
            chartHeight +
            11
        );
    }
}


/* =========================================================
   TOP 5 PRODUCTS
   ========================================================= */

function drawTopProducts(
    products
) {

    const listContainer =
        document.getElementById(
            "top-product-list"
        );


    const canvas =
        document.getElementById(
            "topProductsDoughnut"
        );


    if (
        !listContainer ||
        !canvas
    ) {
        return;
    }


    const safeProducts =
        normalizeTopProducts(
            products
        );


    const colors =
        [
            "#333333",
            "#555555",
            "#777777",
            "#999999",
            "#BBBBBB"
        ];


    /* =====================================================
       TOTAL
       ===================================================== */

    let total =
        0;


    safeProducts.forEach(
        function (product) {

            total +=
                product.soLuong;
        }
    );


    /* =====================================================
       LIST
       ===================================================== */

    if (
        safeProducts.length === 0
    ) {

        listContainer.innerHTML =
            `
            <div class="empty-data">
                Chưa có dữ liệu bán hàng
            </div>
            `;

    } else {

        let html =
            "";


        safeProducts.forEach(
            function (
                product,
                index
            ) {

                html +=
                    `
                    <div class="product-item">

                        <div class="product-name-wrap">

                            <span>
                                ${index + 1}.
                            </span>

                            <div
                                class="color-box"
                                style="
                                    background-color:
                                    ${colors[index]};
                                "
                            ></div>

                            <span
                                title="${escapeHtml(product.tenSanPham)}"
                            >
                                ${escapeHtml(product.tenSanPham)}
                            </span>

                        </div>

                        <span>
                            ${formatNumber(product.soLuong)}
                        </span>

                    </div>
                    `;
            }
        );


        listContainer.innerHTML =
            html;
    }


    /* =====================================================
       CANVAS
       ===================================================== */

    const prepared =
        prepareCanvas(
            canvas
        );


    if (!prepared) {
        return;
    }


    const ctx =
        prepared.ctx;


    const width =
        prepared.width;


    const height =
        prepared.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    /* =====================================================
       NO DATA
       ===================================================== */

    if (
        safeProducts.length === 0
        ||
        total <= 0
    ) {

        drawDonutArc(
            ctx,
            width / 2,
            height / 2,
            Math.min(
                width,
                height
            ) / 2 - 12,
            34,
            0,
            Math.PI * 2,
            "#E0E0E0"
        );


        return;
    }


    /* =====================================================
       DONUT
       ===================================================== */

    const centerX =
        width / 2;


    const centerY =
        height / 2;


    const radius =
        Math.max(
            1,
            Math.min(
                width,
                height
            ) / 2 - 12
        );


    const lineWidth =
        Math.min(
            34,
            radius * 0.38
        );


    let startAngle =
        -Math.PI / 2;


    safeProducts.forEach(
        function (
            product,
            index
        ) {

            if (
                product.soLuong <= 0
            ) {
                return;
            }


            const angle =
                product.soLuong /
                total *
                Math.PI *
                2;


            drawDonutArc(
                ctx,
                centerX,
                centerY,
                radius,
                lineWidth,
                startAngle,
                startAngle +
                    angle,
                colors[index]
            );


            startAngle +=
                angle;
        }
    );
}


/* =========================================================
   NORMALIZE LABELS
   ========================================================= */

function normalizeLabels(
    labels
) {

    if (
        !Array.isArray(labels)
        ||
        labels.length === 0
    ) {

        return createFallbackLabels();
    }


    const result =
        labels
            .slice(
                0,
                7
            )
            .map(
                function (label) {

                    return String(
                        label
                    );
                }
            );


    while (
        result.length < 7
    ) {

        result.push("");
    }


    return result;
}


/* =========================================================
   FALLBACK LABELS
   ========================================================= */

function createFallbackLabels() {

    const result =
        [];


    const today =
        new Date();


    for (
        let i = 6;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                today
            );


        date.setDate(
            today.getDate() -
            i
        );


        result.push(
            formatDateLabel(
                date
            )
        );
    }


    return result;
}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDateLabel(
    date
) {

    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    return (
        day +
        "/" +
        month
    );
}


/* =========================================================
   NORMALIZE 7 VALUES
   ========================================================= */

function normalizeSevenValues(
    values
) {

    let result =
        Array.isArray(values)

            ? values
                .slice(
                    0,
                    7
                )
                .map(
                    function (value) {

                        return toNumber(
                            value
                        );
                    }
                )

            : [];


    while (
        result.length < 7
    ) {

        result.push(0);
    }


    return result;
}


/* =========================================================
   NORMALIZE TOP PRODUCTS
   ========================================================= */

function normalizeTopProducts(
    products
) {

    if (
        !Array.isArray(products)
    ) {

        return [];
    }


    return products
        .slice(
            0,
            5
        )
        .map(
            function (product) {

                return {

                    sanPhamId:
                        product.sanPhamId
                        ??
                        null,

                    tenSanPham:
                        product.tenSanPham
                        ||
                        "Sản phẩm",

                    soLuong:
                        toNumber(
                            product.soLuongBan
                            ??
                            product.soLuong
                            ??
                            0
                        )
                };
            }
        );
}


/* =========================================================
   TO NUMBER
   ========================================================= */

function toNumber(
    value
) {

    if (
        value === null
        ||
        value === undefined
        ||
        value === ""
    ) {

        return 0;
    }


    const result =
        Number(
            value
        );


    if (
        Number.isFinite(
            result
        )
    ) {

        return result;
    }


    return 0;
}


/* =========================================================
   CALCULATE GROWTH
   ========================================================= */

function calculateGrowth(
    current,
    previous
) {

    current =
        toNumber(
            current
        );


    previous =
        toNumber(
            previous
        );


    if (
        previous > 0
    ) {

        return (
            current -
            previous
        )
        /
        previous
        *
        100;
    }


    if (
        current > 0
    ) {

        return 100;
    }


    return 0;
}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(
    value
) {

    value =
        toNumber(
            value
        );


    return Math.round(
        value
    ).toLocaleString(
        "vi-VN"
    );
}


/* =========================================================
   FORMAT REVENUE
   ========================================================= */

function formatRevenueAxis(
    value
) {

    value =
        toNumber(
            value
        );


    if (
        value >= 1000000000
    ) {

        return (
            (
                value /
                1000000000
            ).toFixed(1)
            +
            "B"
        );
    }


    if (
        value >= 1000000
    ) {

        return (
            (
                value /
                1000000
            ).toFixed(1)
            +
            "M"
        );
    }


    if (
        value >= 1000
    ) {

        return (
            (
                value /
                1000
            ).toFixed(0)
            +
            "K"
        );
    }


    return Math.round(
        value
    ).toString();
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(
    value
) {

    return String(
        value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}