package com.example.demo.repository;

import com.example.demo.entity.SanPham;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SanPhamRepository extends JpaRepository<SanPham, Integer> {

    @Query("""
        SELECT s FROM SanPham s WHERE LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimKiemSanPhamTheoTen(@Param("tenSP") String tenSP);

    @Query("""
        SELECT s FROM SanPham s WHERE s.id = :id OR LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimKiemSanPhamTheoIDVaTen(@Param("id") Integer id, @Param("tenSP") String tenSP);

    @Query("""
        SELECT s FROM SanPham s WHERE s.loaiSP = :loaiSP
    """)
    List<SanPham> TimSanPhamTheoLoaiSP(@Param("loaiSP") String loaiSP);

    @Query("""
        SELECT s FROM SanPham s WHERE s.loaiSP = :loaiSP AND LOWER(s.tenSP) LIKE LOWER(CONCAT('%', :tenSP, '%'))
    """)
    List<SanPham> TimSanPhamTheoLoaiSPvaTenSP(@Param("loaiSP") String loaiSP,@Param("tenSP") String tenSP);
}