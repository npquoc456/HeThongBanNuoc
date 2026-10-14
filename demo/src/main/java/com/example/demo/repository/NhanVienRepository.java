package com.example.demo.repository;

import com.example.demo.constant.VaiTro;
import com.example.demo.entity.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface NhanVienRepository extends JpaRepository<NhanVien, Integer> {
    
    // 1. Đăng nhập theo ID và Mật khẩu
    @Query(""" 
        SELECT n 
        FROM NhanVien n 
        WHERE n.id = :id AND n.matKhau = :matKhau 
    """)
    Optional<NhanVien> TimNhanVienTheoIDvaMK(@Param("id") Integer id, @Param("matKhau") String matKhau);

    // 2. Tìm nhân viên theo ID hoặc Tên
    @Query("""
        SELECT n 
        FROM NhanVien n 
        WHERE n.id = :id OR LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :ten, '%')) 
    """)
    List<NhanVien> TimNhanVienTheoIDvaTen(@Param("id") Integer id, @Param("ten") String hoTen);

    // 3. Tìm nhân viên theo Tên
    @Query("""
        SELECT n 
        FROM NhanVien n 
        WHERE LOWER(n.hoTen) LIKE LOWER(CONCAT('%', :ten, '%'))
    """)
    List<NhanVien> TimNhanVienTheoTen(@Param("ten") String hoTen);

    // 4. Lọc nhân viên theo Vai trò (QUAN_LY / NHAN_VIEN)
    @Query("""
        SELECT n 
        FROM NhanVien n 
        WHERE n.vaiTro = :vaiTro
    """)
    List<NhanVien> TimNhanVienTheoVaiTro(@Param("vaiTro") VaiTro vaiTro);

}