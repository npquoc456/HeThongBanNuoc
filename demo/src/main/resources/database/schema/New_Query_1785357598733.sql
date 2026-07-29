
INSERT INTO calam(id,ten_ca,thoi_gian_bd,thoi_gian_kt)
VALUES
(1,'Ca sáng','07:00','11:00'),
(2,'Ca chiều','11:00','17:00'),
(3,'Ca tối','17:00','22:00');

INSERT INTO nhanvien
(id,ten,email,phone,mat_khau,ngay_sinh,ngay_vao,ca_id,vai_tro,trang_thai)
VALUES
(1,'Nguyen Phu Quoc','quoc@gmail.com','0901111111','123456','2006-11-16','2025-03-14',1,'ADMIN','DANG_LAM_VIEC'),
(2,'Tran Van A','a@gmail.com','0902222222','123456','2003-05-20','2025-01-10',2,'NHANVIEN','DANG_LAM_VIEC'),
(3,'Le Thi B','b@gmail.com','0903333333','123456','2002-09-18','2025-02-20',3,'NHANVIEN','TAM_NGHI');

INSERT INTO ctca
VALUES
(1,1),
(2,2),
(3,3);

INSERT INTO tktrungthanh
(id,ten_kh,so_luong_mua,ngay_tao)
VALUES
(1,'Nguyen Van Nam',20,'2026-01-01'),
(2,'Tran Thi Hoa',15,'2026-02-10'),
(3,'Pham Minh',8,'2026-03-01');

INSERT INTO sanpham
(id,ten_sp,gia,mo_ta,loai)
VALUES
(1,'Cafe sữa',30000,'Cafe sữa đá','CA_PHE'),
(2,'Cafe đen',25000,'Cafe đen đá','CA_PHE'),
(3,'Trà đào',35000,'Trà đào cam sả','TRA'),
(4,'Matcha Latte',45000,'Matcha Nhật','MATCHA');

INSERT INTO nguyenlieu
(id,ten_nl,so_luong,don_vi,trang_thai)
VALUES
(1,'Cafe',10000,'gram','CON_HANG'),
(2,'Sữa đặc',100,'lon','CON_HANG'),
(3,'Đường',5000,'gram','CON_HANG'),
(4,'Trà',3000,'gram','CON_HANG'),
(5,'Matcha',2000,'gram','CON_HANG');

INSERT INTO ctnl
VALUES
(1,1,20),
(1,2,30),
(1,3,10),
(2,1,25),
(2,3,8),
(3,4,15),
(4,5,15);

INSERT INTO hoadon
(id,kh_id,nv_id,tong_hd,trang_thai,ngay_hd,phuong_thuc)
VALUES
(1,1,1,55000,'DA_XAC_NHAN','2026-07-30 08:00:00','TIEN_MAT'),
(2,2,2,70000,'CHO_XAC_NHAN','2026-07-30 09:30:00','CHUYEN_KHOAN');

INSERT INTO cthd
VALUES
(1,1,1,30000),
(1,2,1,25000),
(2,3,2,35000);