-- Chọn database MayBanNuoc trên kết nối MySQL trước khi chạy script này.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS cthd;
DROP TABLE IF EXISTS ketca;
DROP TABLE IF EXISTS hoadon;
DROP TABLE IF EXISTS ctnl;
DROP TABLE IF EXISTS ctca;
DROP TABLE IF EXISTS sanpham;
DROP TABLE IF EXISTS nguyenlieu;
DROP TABLE IF EXISTS tktrungthanh;
DROP TABLE IF EXISTS nhanvien;
DROP TABLE IF EXISTS calam;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================
-- CA LÀM
-- =========================
CREATE TABLE calam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_ca VARCHAR(50) NOT NULL,
    thoi_gian_bd VARCHAR(50) NOT NULL,
    thoi_gian_kt VARCHAR(50) NOT NULL
);

-- =========================
-- NHÂN VIÊN
-- =========================
CREATE TABLE nhanvien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    mat_khau VARCHAR(255) NOT NULL,
    ngay_sinh DATE,
    ngay_vao DATE,
    ca_id INT,
    vai_tro VARCHAR(20),
    trang_thai VARCHAR(20),

    CONSTRAINT fk_nv_ca
        FOREIGN KEY (ca_id)
        REFERENCES calam(id)
);

-- =========================
-- CHI TIẾT CA
-- =========================
CREATE TABLE ctca (
    nv_id INT,
    cl_id INT,

    PRIMARY KEY (nv_id, cl_id),

    CONSTRAINT fk_ctca_nv
        FOREIGN KEY (nv_id)
        REFERENCES nhanvien(id),

    CONSTRAINT fk_ctca_ca
        FOREIGN KEY (cl_id)
        REFERENCES calam(id)
);

-- =========================
-- KHÁCH HÀNG
-- =========================
CREATE TABLE tktrungthanh (
    id INT PRIMARY KEY,
    ten_kh VARCHAR(100) NOT NULL,
    so_luong_mua INT DEFAULT 0,
    ngay_tao DATE
);

-- =========================
-- SẢN PHẨM
-- =========================
CREATE TABLE sanpham (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_sp VARCHAR(100) NOT NULL,
    gia DECIMAL(10,2) NOT NULL,
    mo_ta TEXT,
    loai VARCHAR(50)
);
alter table sanpham add column hinh_anh VARCHAR(255);
-- =========================
-- NGUYÊN LIỆU
-- =========================
CREATE TABLE nguyenlieu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten_nl VARCHAR(100) NOT NULL,
    so_luong DOUBLE DEFAULT 0,
    don_vi VARCHAR(20) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL
);

-- =========================
-- CHI TIẾT NGUYÊN LIỆU
-- =========================
CREATE TABLE ctnl (
    sp_id INT,
    nl_id INT,
    so_luong_can DOUBLE NOT NULL,

    PRIMARY KEY (sp_id, nl_id),

    CONSTRAINT fk_ctnl_sp
        FOREIGN KEY (sp_id)
        REFERENCES sanpham(id),

    CONSTRAINT fk_ctnl_nl
        FOREIGN KEY (nl_id)
        REFERENCES nguyenlieu(id)
);

-- =========================
-- HÓA ĐƠN
-- =========================
CREATE TABLE hoadon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kh_id INT,
    nv_id INT,
    tong_hd DECIMAL(12,2) DEFAULT 0,
    trang_thai VARCHAR(30),
    ngay_hd DATETIME DEFAULT CURRENT_TIMESTAMP,
    phuong_thuc VARCHAR(30),
    tien_khach_dua DECIMAL(12,2),
    tien_thoi DECIMAL(12,2),

    CONSTRAINT fk_hd_kh
        FOREIGN KEY (kh_id)
        REFERENCES tktrungthanh(id),

    CONSTRAINT fk_hd_nv
        FOREIGN KEY (nv_id)
        REFERENCES nhanvien(id)
);

-- =========================
-- BIÊN BẢN KẾT CA / BÀN GIAO TIỀN
-- =========================
CREATE TABLE ketca (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id INT NOT NULL,
    staff_name VARCHAR(100) NOT NULL,
    shift_started_at DATETIME NOT NULL,
    closed_at DATETIME NOT NULL,
    counted_cash BIGINT NOT NULL,
    expected_cash BIGINT NOT NULL DEFAULT 0,
    cash_difference BIGINT NOT NULL DEFAULT 0,
    float_fund BIGINT NOT NULL,
    cash_handover BIGINT NOT NULL,
    bank_transfer BIGINT NOT NULL,
    total_submit BIGINT NOT NULL,
    denominations_json TEXT NOT NULL,
    CONSTRAINT uk_ketca_staff_started UNIQUE (staff_id, shift_started_at)
);

-- =========================
-- CHI TIẾT HÓA ĐƠN
-- =========================
CREATE TABLE cthd (
    hd_id INT,
    sp_id INT,
    so_luong INT NOT NULL,
    don_gia DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (hd_id, sp_id),

    CONSTRAINT fk_cthd_hd
        FOREIGN KEY (hd_id)
        REFERENCES hoadon(id),

    CONSTRAINT fk_cthd_sp
        FOREIGN KEY (sp_id)
        REFERENCES sanpham(id)
);
