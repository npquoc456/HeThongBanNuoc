package com.example.demo.repository;

import com.example.demo.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {

    // 1. TÌM KIẾM THEO ID
    // Lưu ý: Bạn KHÔNG CẦN viết hàm tìm kiếm theo ID ở đây vì JpaRepository 
    // đã cung cấp sẵn hàm: Optional<SanPham> findById(Integer id);


    // 2. TÌM KIẾM THEO TÊN SẢN PHẨM (Search)
    // Chữ "Containing" tương đương với LIKE '%keyword%' trong SQL (tìm từ khóa chứa trong chuỗi).
    // Chữ "IgnoreCase" giúp tìm kiếm không phân biệt chữ hoa, chữ thường.
    @Query("""
        SELECT s FROM SanPham s WHERE LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimKiemSanPhamTheoTen(@Param("tenSP") String tenSP);


    // 3. TÌM KIẾM KẾT HỢP: THEO ID HOẶC THEO TÊN
    // Dành cho trường hợp bạn chỉ có 1 ô tìm kiếm (người dùng nhập số thì tìm ID, nhập chữ thì tìm tên)
    @Query("""
        SELECT s FROM SanPham s WHERE s.id = :id OR LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimKiemSanPhamTheoIDVaTen(@Param("id") Integer id, @Param("tenSP") String tenSP);


    // 4. PHÂN LOẠI THEO LOẠI SẢN PHẨM (Filter)
    // Tìm chính xác các sản phẩm thuộc một loại cụ thể
    @Query("""
        SELECT s FROM SanPham s WHERE s.loaiSP = :loaiSP
    """)
    List<SanPham> TimSanPhamTheoLoaiSP(@Param("loaiSP") String loaiSP);

    // 5. KẾT HỢP: VỪA PHÂN LOẠI VỪA TÌM KIẾM TÊN
    // Ví dụ: Tìm các sản phẩm có chữ "Đá" TRONG danh mục "Cà phê"
    @Query("""
        SELECT s FROM SanPham s WHERE s.loaiSP = :loaiSP AND LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimSanPhamTheoLoaiSPvaTenSP(@Param("loaiSP") String loaiSP,@Param("tenSP") String tenSP);
}