package com.example.demo.repository;

import com.example.demo.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {
    @Query(""" 
        SELECT n 
        FROM NhanVien n 
        WHERE n.id = :id AND n.matKhau = :matKhau 
    """)
    Optional<NhanVien> TimNhanVienTheoIDvaMK(@Param("id") int id, @Param("matKhau") String matKhau);

    @Query("""
        SELECT n 
        FROM NhanVien n 
        WHERE n.id = :id OR LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :tenNV, '%')) 
    """)
    List<NhanVien> TimNhanVienTheoIDvaTen(@Param("id") int id,@Param("ten") String hoTen);

    @Query("""
        SELECT n FROM NhanVien n WHERE LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :tenNV, '%'))
    """)
    List<NhanVien> TimNhanVienTheoTen(@Param("ten") String hoTen);

} 