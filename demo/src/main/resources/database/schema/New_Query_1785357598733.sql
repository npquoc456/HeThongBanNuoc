
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

INSERT INTO tktrungthanh (id, ten_kh, so_luong_mua, ngay_tao) VALUES
-- Dữ liệu cũ đã cập nhật ID thành SĐT
('0901234567', 'Nguyen Van Nam', 20, '2026-01-01'),
('0912345678', 'Tran Thi Hoa', 15, '2026-02-10'),
('0987654321', 'Pham Minh', 8, '2026-03-01'),

-- Dữ liệu bổ sung thêm
('0933456789', 'Le Thi Lan', 45, '2026-03-15'),
('0977112233', 'Hoang Quan', 12, '2026-04-05'),
('0888999111', 'Doan Tuan Anh', 30, '2026-04-20'),
('0945666777', 'Vuong Ngoc Mai', 5, '2026-05-12'),
('0909111222', 'Ly Hai', 50, '2026-06-01'),
('0922334455', 'Bui Thi Xuan', 18, '2026-06-15'),
('0966778899', 'Ngo Thanh Van', 3, '2026-07-02');

INSERT INTO sanpham
(id,ten_sp,gia,mo_ta,loai,hinh_anh)
VALUES
(1,'Cafe sữa',30000,'Cafe sữa đá','CA_PHE', 'productimages/cafesua.png'),
(2,'Cafe đen',25000,'Cafe đen đá','CA_PHE', 'productimages/cafeden.png'),
(3, 'Bạc xỉu', 35000, 'Bạc xỉu đá nhiều sữa', 'CA_PHE', 'productimages/bacxiu.png'),
(4,'Trà đào',35000,'Trà đào cam sả','TRA','productimages/tradao.png'),
(5,'Matcha Latte',45000,'Matcha Nhật','MATCHA','productimages/matcha.png'),
(6, 'Trà vải', 35000, 'Trà vải dầm nha đam', 'TRA', 'productimages/travai.png');

INSERT INTO sanpham (id, ten_sp, gia, mo_ta, loai, hinh_anh) VALUES
(7,'Matcha Latte',45000,'Matcha Nhật','MATCHA','productimages/matchanhat.png'), 
(8, 'Sinh tố dâu', 45000, 'Sinh tố dâu tây tươi', 'SINH_TO', 'productimages/nuocepdau.png'),
(9, 'Nước ép cam', 40000, 'Nước ép cam nguyên chất', 'NUOC_EP', 'productimages/nuoccam.png'), 
(10, 'Cookies đá xay', 50000, 'Oreo đá xay thêm bánh quy', 'DA_XAY', 'productimages/oreodaxay.png');
-- (6, 'Trà vải', 35000, 'Trà vải dầm nha đam', 'TRA'),
-- (7, 'Trà Oolong nướng', 40000, 'Trà Oolong nướng trân châu trắng', 'TRA'),
-- (8, 'Trà hoa cúc', 35000, 'Trà hoa cúc mật ong nóng', 'TRA'),

-- -- Nhóm Sinh tố & Nước ép
-- (9, 'Sinh tố dâu', 45000, 'Sinh tố dâu tây tươi', 'SINH_TO'),
-- (10, 'Sinh tố bơ', 45000, 'Sinh tố bơ sáp béo', 'SINH_TO'),
-- (11, 'Nước ép cam', 40000, 'Nước ép cam nguyên chất', 'NUOC_EP'),
-- (12, 'Nước ép táo', 40000, 'Nước ép táo mix cà rốt', 'NUOC_EP'),

-- -- Nhóm Đá xay (Frappuccino)
-- (13, 'Mocha đá xay', 55000, 'Mocha đá xay phủ kem whipping', 'DA_XAY'),
-- (14, 'Cookies đá xay', 50000, 'Oreo đá xay thêm bánh quy', 'DA_XAY'),

-- -- Nhóm Bánh ngọt (Pastries / Cakes)
-- (15, 'Bánh Croissant', 35000, 'Bánh sừng bò bơ Pháp nướng nóng', 'BANH'),
-- (16, 'Bánh Tiramisu', 45000, 'Bánh Tiramisu vị cafe Ý', 'BANH'),
-- (17, 'Mousse Chanh Dây', 40000, 'Bánh mousse chua ngọt thanh mát', 'BANH'),
-- (18, 'Cheesecake nướng', 50000, 'Bánh phô mai nướng Basque béo ngậy', 'BANH'),
-- (19, 'Red Velvet', 45000, 'Bánh Red Velvet kẹp kem phô mai', 'BANH'),
-- (20, 'Bánh mì bơ tỏi', 30000, 'Bánh mì mini sốt bơ tỏi phô mai', 'BANH');



INSERT INTO nguyenlieu 
(id, ten_nl, so_luong, don_vi, trang_thai) 
VALUES
-- Nguyên liệu cho nhóm Cafe (Cafe sữa, Cafe đen, Bạc xỉu)
(1, 'Bột cà phê rang xay', 20.5, 'kg', 'CON_HANG'),
(2, 'Sữa đặc', 50, 'lon', 'CON_HANG'),
(3, 'Sữa tươi không đường', 30, 'lít', 'CON_HANG'),

-- Nguyên liệu cho nhóm Trà (Trà đào cam sả, Trà vải)
(4, 'Trà đen túi lọc', 15, 'gói', 'CON_HANG'),
(5, 'Đào ngâm', 24, 'hộp', 'CON_HANG'),
(6, 'Cam tươi', 10, 'kg', 'CON_HANG'),
(7, 'Sả tươi', 5, 'kg', 'CON_HANG'),
(8, 'Vải ngâm', 24, 'hộp', 'CON_HANG'),
(9, 'Thạch nha đam', 15, 'hộp', 'CON_HANG'),

-- Nguyên liệu cho nhóm Matcha
(10, 'Bột Matcha Nhật Bản', 5.5, 'kg', 'CON_HANG'),

-- Nguyên liệu cho nhóm Sinh tố & Nước ép (Sinh tố dâu, Nước ép cam)
(11, 'Dâu tây tươi', 0, 'kg', 'HET_HANG'), 

-- Nguyên liệu cho nhóm Đá xay (Cookies đá xay)
(12, 'Bánh Oreo', 40, 'bịch', 'CON_HANG'),
(13, 'Kem béo (Whipping Cream)', 15, 'hộp', 'CON_HANG'),

-- Nguyên liệu pha chế chung
(14, 'Đường cát trắng', 30, 'kg', 'CON_HANG'),
(15, 'Nước đường (Syrup)', 20, 'chai', 'CON_HANG'),
(16, 'Đá viên', 50, 'bao', 'CON_HANG');

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

-- 1. Xóa sạch hóa đơn và chi tiết bị lỗi cũ để làm lại
DELETE FROM cthd;
DELETE FROM hoadon;

-- 2. Thêm Hóa đơn chuẩn (kh_id phải khớp với SĐT trong bảng tktrungthanh, hoặc NULL nếu khách lẻ)
INSERT INTO hoadon (id, kh_id, nv_id, tong_hd, trang_thai, ngay_hd, phuong_thuc) VALUES
(1, '0901234567', 1, 55000, 'DA_XAC_NHAN', '2026-07-30 08:00:00', 'TIEN_MAT'),
(2, NULL, 1, 70000, 'CHO_XAC_NHAN', '2026-07-30 09:30:00', 'CHUYEN_KHOAN');

-- 3. Thêm Chi tiết hóa đơn (Phải chỉ định rõ tên cột để MySQL không bị nhầm)
INSERT INTO cthd (hd_id, sp_id, so_luong, don_gia) VALUES
(1, 1, 1, 30000), -- Hóa đơn 1: 1 Cafe sữa
(1, 2, 1, 25000), -- Hóa đơn 1: 1 Cafe đen
(2, 3, 2, 35000); -- Hóa đơn 2: 2 Bạc xỉu