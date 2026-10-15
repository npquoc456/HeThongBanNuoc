-- Chọn database MayBanNuoc trước khi chạy migration.
CREATE TABLE IF NOT EXISTS lich_ca (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nhan_vien_id INT NOT NULL,
    ngay_lam DATE NOT NULL,
    ten_ca VARCHAR(50) NOT NULL,
    thoi_gian_bd VARCHAR(5) NOT NULL,
    thoi_gian_kt VARCHAR(5) NOT NULL,
    CONSTRAINT fk_lich_ca_nhan_vien
        FOREIGN KEY (nhan_vien_id) REFERENCES nhanvien(id),
    INDEX idx_lich_ca_ngay_lam (ngay_lam),
    INDEX idx_lich_ca_nhan_vien_ngay (nhan_vien_id, ngay_lam)
);
