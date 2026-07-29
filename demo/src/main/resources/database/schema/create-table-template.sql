USE MayBanNuoc;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS cthd;
DROP TABLE IF EXISTS hoadon;
DROP TABLE IF EXISTS ctnl;
DROP TABLE IF EXISTS sanpham;
DROP TABLE IF EXISTS nguyenlieu;
DROP TABLE IF EXISTS nhanvien;
DROP TABLE IF EXISTS tktrungthanh;
DROP TABLE IF EXISTS calam;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE calam (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenCa VARCHAR(50) NOT NULL,
    thoiGianBD VARCHAR(50) NOT NULL,
    thoiGianKT VARCHAR(50) NOT NULL
);

CREATE TABLE ctca (
    nv_id INT, 
    cl_id INT, 

    PRIMARY KEY (nv_id, cl_id)
);

CREATE TABLE nhanvien (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(15),
    matKhau VARCHAR(255) NOT NULL,
    ngaySinh DATE,
    ngayVao DATE,
    ca_id INT,
    vaitro VARCHAR(10),

    FOREIGN KEY (ca_id) REFERENCES calam(id)
);

alter table nhanvien add trangThaiLamViec Varchar(20);

CREATE TABLE tktrungthanh (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenKH VARCHAR(100) NOT NULL,
    soLuongMua INT DEFAULT 0
);
alter table tktrungthanh add ngayTao date;

CREATE TABLE sanpham (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenSP VARCHAR(100) NOT NULL,
    gia DECIMAL(10,2) NOT NULL,
    moTa TEXT,
    loai VARCHAR(50)
);

CREATE TABLE nguyenlieu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenNL VARCHAR(100) NOT NULL,
    soLuong INT DEFAULT 0,
    donvi VARCHAR(20) NOT NULL,
    trangthai VARCHAR(20) NOT NULL
);
 
CREATE TABLE ctnl (
    sp_id INT ,
    nl_id INT ,
    soLuongCan DECIMAL(10,2) NOT NULL,
    
    PRIMARY KEY (sp_id, nl_id),
    FOREIGN KEY (sp_id) REFERENCES sanpham(id),
    FOREIGN KEY (nl_id) REFERENCES nguyenlieu(id)
);
drop table ctnl;
CREATE TABLE hoadon (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kh_id INT,
    nv_id INT,
    tongHD DECIMAL(12,2) DEFAULT 0,
    trangThai VARCHAR(30),
    ngayHD DATETIME DEFAULT CURRENT_TIMESTAMP,
    phuongThuc VARCHAR(30),

    FOREIGN KEY (kh_id) REFERENCES tktrungthanh(id),
    FOREIGN KEY (nv_id) REFERENCES nhanvien(id)
);

CREATE TABLE cthd (
    hd_id INT NOT NULL,
    sp_id INT NOT NULL,
    sl INT NOT NULL,
    donGia DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (hd_id, sp_id),
    FOREIGN KEY (hd_id) REFERENCES hoadon(id),
    FOREIGN KEY (sp_id) REFERENCES sanpham(id)
);