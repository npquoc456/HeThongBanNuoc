package com.example.demo.repository;

import com.example.demo.entity.HoaDon;
import com.example.demo.constant.TrangThaiHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface HoaDonRepository extends JpaRepository<HoaDon, Integer> {

    @Query("""
        SELECT h FROM HoaDon h WHERE h.trangThai = :trangThai AND h.ngayTao = :ngay
        """)
    List<HoaDon> TimHoaDonTheoTrangThai(
        @Param("trangThai") TrangThaiHoaDon trangThai, 
        @Param("ngay") LocalDate ngay
    );

}