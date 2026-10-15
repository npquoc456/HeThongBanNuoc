-- Chọn database MayBanNuoc trước khi chạy. Định mức bên dưới là số lượng ước tính
-- theo đúng đơn vị tồn kho; hiệu chỉnh lại theo công thức thực tế của cửa hàng.

SET @needs_minimum_column = (
    SELECT COUNT(*) = 0 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nguyenlieu' AND COLUMN_NAME = 'so_luong_toi_thieu'
);
SET @add_so_luong_toi_thieu = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nguyenlieu' AND COLUMN_NAME = 'so_luong_toi_thieu') = 0,
    'ALTER TABLE nguyenlieu ADD COLUMN so_luong_toi_thieu DOUBLE NOT NULL DEFAULT 0',
    'SELECT 1'
);
PREPARE stmt_add_so_luong_toi_thieu FROM @add_so_luong_toi_thieu;
EXECUTE stmt_add_so_luong_toi_thieu;
DEALLOCATE PREPARE stmt_add_so_luong_toi_thieu;

UPDATE nguyenlieu
SET so_luong_toi_thieu = CASE id
    WHEN 1 THEN 2
    WHEN 2 THEN 5
    WHEN 3 THEN 3
    WHEN 4 THEN 2
    WHEN 5 THEN 3
    WHEN 6 THEN 2
    WHEN 7 THEN 1
    WHEN 8 THEN 3
    WHEN 9 THEN 2
    WHEN 10 THEN 0.5
    WHEN 11 THEN 1
    WHEN 12 THEN 5
    WHEN 13 THEN 2
    WHEN 14 THEN 3
    WHEN 15 THEN 2
    WHEN 16 THEN 5
    ELSE so_luong_toi_thieu
END
WHERE @needs_minimum_column = 1 AND id BETWEEN 1 AND 16;

-- Add recipe ingredients absent from older databases without inventing their stock.
INSERT INTO nguyenlieu (ten_nl, so_luong, so_luong_toi_thieu, don_vi, trang_thai)
SELECT 'Bột cà phê rang xay', 0, 2, 'kg', 'HET_HANG'
WHERE NOT EXISTS (
    SELECT 1 FROM nguyenlieu WHERE LOWER(TRIM(ten_nl)) = LOWER('Bột cà phê rang xay')
);

INSERT INTO nguyenlieu (ten_nl, so_luong, so_luong_toi_thieu, don_vi, trang_thai)
SELECT 'Sữa đặc', 0, 5, 'lon', 'HET_HANG'
WHERE NOT EXISTS (
    SELECT 1 FROM nguyenlieu WHERE LOWER(TRIM(ten_nl)) = LOWER('Sữa đặc')
);

INSERT INTO nguyenlieu (ten_nl, so_luong, so_luong_toi_thieu, don_vi, trang_thai)
SELECT 'Sả tươi', 0, 1, 'kg', 'HET_HANG'
WHERE NOT EXISTS (
    SELECT 1 FROM nguyenlieu WHERE LOWER(TRIM(ten_nl)) = LOWER('Sả tươi')
);

-- Remove only the original sample rows with their unchanged, invalid quantities.
DELETE FROM ctnl
WHERE (sp_id = 1 AND nl_id = 1 AND so_luong_can = 20)
   OR (sp_id = 1 AND nl_id = 2 AND so_luong_can = 30)
   OR (sp_id = 1 AND nl_id = 3 AND so_luong_can = 10)
   OR (sp_id = 2 AND nl_id = 1 AND so_luong_can = 25)
   OR (sp_id = 2 AND nl_id = 3 AND so_luong_can = 8)
   OR (sp_id = 3 AND nl_id = 4 AND so_luong_can = 15)
   OR (sp_id = 4 AND nl_id = 5 AND so_luong_can = 15);

INSERT INTO ctnl (sp_id, nl_id, so_luong_can)
SELECT sp.id, nl.id, recipe.so_luong_can
FROM (
    SELECT 'Cafe sữa' ten_sp, 'CA_PHE' loai, 'Bột cà phê rang xay' ten_nl, 0.018 so_luong_can
    UNION ALL SELECT 'Cafe sữa', 'CA_PHE', 'Sữa đặc', 0.04
    UNION ALL SELECT 'Cafe sữa', 'CA_PHE', 'Nước đường (Syrup)', 0.02
    UNION ALL SELECT 'Cafe sữa', 'CA_PHE', 'Đá viên', 0.03
    UNION ALL SELECT 'Cafe đen', 'CA_PHE', 'Bột cà phê rang xay', 0.018
    UNION ALL SELECT 'Cafe đen', 'CA_PHE', 'Nước đường (Syrup)', 0.025
    UNION ALL SELECT 'Cafe đen', 'CA_PHE', 'Đá viên', 0.03
    UNION ALL SELECT 'Bạc xỉu', 'CA_PHE', 'Bột cà phê rang xay', 0.012
    UNION ALL SELECT 'Bạc xỉu', 'CA_PHE', 'Sữa đặc', 0.035
    UNION ALL SELECT 'Bạc xỉu', 'CA_PHE', 'Sữa tươi không đường', 0.12
    UNION ALL SELECT 'Bạc xỉu', 'CA_PHE', 'Đá viên', 0.03
    UNION ALL SELECT 'Trà đào', 'TRA', 'Trà đen túi lọc', 0.01
    UNION ALL SELECT 'Trà đào', 'TRA', 'Đào ngâm', 0.05
    UNION ALL SELECT 'Trà đào', 'TRA', 'Cam tươi', 0.03
    UNION ALL SELECT 'Trà đào', 'TRA', 'Sả tươi', 0.01
    UNION ALL SELECT 'Trà đào', 'TRA', 'Nước đường (Syrup)', 0.02
    UNION ALL SELECT 'Trà đào', 'TRA', 'Đá viên', 0.03
    UNION ALL SELECT 'Matcha Latte', 'MATCHA', 'Sữa tươi không đường', 0.15
    UNION ALL SELECT 'Matcha Latte', 'MATCHA', 'Bột Matcha Nhật Bản', 0.008
    UNION ALL SELECT 'Matcha Latte', 'MATCHA', 'Đá viên', 0.03
    UNION ALL SELECT 'Trà vải', 'TRA', 'Trà đen túi lọc', 0.01
    UNION ALL SELECT 'Trà vải', 'TRA', 'Vải ngâm', 0.05
    UNION ALL SELECT 'Trà vải', 'TRA', 'Thạch nha đam', 0.04
    UNION ALL SELECT 'Trà vải', 'TRA', 'Nước đường (Syrup)', 0.02
    UNION ALL SELECT 'Trà vải', 'TRA', 'Đá viên', 0.03
    UNION ALL SELECT 'Sinh tố dâu', 'SINH_TO', 'Dâu tây', 0.1
    UNION ALL SELECT 'Sinh tố dâu', 'SINH_TO', 'Sữa tươi không đường', 0.1
    UNION ALL SELECT 'Sinh tố dâu', 'SINH_TO', 'Đá viên', 0.03
    UNION ALL SELECT 'Nước ép cam', 'NUOC_EP', 'Cam tươi', 0.25
    UNION ALL SELECT 'Nước ép cam', 'NUOC_EP', 'Nước đường (Syrup)', 0.02
    UNION ALL SELECT 'Nước ép cam', 'NUOC_EP', 'Đá viên', 0.02
    UNION ALL SELECT 'Cookies đá xay', 'DA_XAY', 'Sữa tươi không đường', 0.1
    UNION ALL SELECT 'Cookies đá xay', 'DA_XAY', 'Bánh Oreo', 0.03
    UNION ALL SELECT 'Cookies đá xay', 'DA_XAY', 'Kem béo (Whipping Cream)', 0.05
    UNION ALL SELECT 'Cookies đá xay', 'DA_XAY', 'Đá viên', 0.03
) recipe
JOIN sanpham sp
    ON LOWER(TRIM(sp.ten_sp)) = LOWER(recipe.ten_sp)
    AND UPPER(TRIM(sp.loai)) = recipe.loai
JOIN nguyenlieu nl
    ON (
        recipe.ten_nl = 'Dâu tây'
        AND (LOWER(TRIM(nl.ten_nl)) LIKE '%dâu%' OR LOWER(TRIM(nl.ten_nl)) LIKE '%dau%')
    ) OR (
        recipe.ten_nl <> 'Dâu tây'
        AND BINARY LOWER(TRIM(nl.ten_nl)) = BINARY LOWER(recipe.ten_nl)
    )
ON DUPLICATE KEY UPDATE so_luong_can = ctnl.so_luong_can;

-- Older data may contain both "Đá viên" and "Da Vien". Remove the latter only
-- from recipes that already use the standard inventory item, comparing accents
-- explicitly so an accent-insensitive database collation cannot match both.
DROP TEMPORARY TABLE IF EXISTS migration_duplicate_recipe_ice;
CREATE TEMPORARY TABLE migration_duplicate_recipe_ice AS
SELECT DISTINCT alternate_recipe.sp_id, alternate_recipe.nl_id
FROM ctnl alternate_recipe
JOIN nguyenlieu alternate_ingredient ON alternate_ingredient.id = alternate_recipe.nl_id
WHERE BINARY LOWER(TRIM(alternate_ingredient.ten_nl)) = BINARY 'da vien'
  AND EXISTS (
      SELECT 1
      FROM ctnl standard_recipe
      JOIN nguyenlieu standard_ingredient ON standard_ingredient.id = standard_recipe.nl_id
      WHERE standard_recipe.sp_id = alternate_recipe.sp_id
        AND BINARY LOWER(TRIM(standard_ingredient.ten_nl)) = BINARY 'đá viên'
  );

DELETE duplicate_recipe
FROM ctnl duplicate_recipe
JOIN migration_duplicate_recipe_ice duplicate_key
    ON duplicate_key.sp_id = duplicate_recipe.sp_id
    AND duplicate_key.nl_id = duplicate_recipe.nl_id;
DROP TEMPORARY TABLE migration_duplicate_recipe_ice;
