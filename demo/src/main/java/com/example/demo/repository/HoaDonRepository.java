package com.example.demo.repository;

import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.entity.HoaDon;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.util.List;


public interface HoaDonRepository
        extends JpaRepository<HoaDon, Integer> {

    boolean existsByTkTrungThanh_Id(Integer customerId);

    // ==========================================================
    // Tìm hóa đơn trong một ngày
    // ==========================================================

    @Query("""
        SELECT h
        FROM HoaDon h
        WHERE h.trangThai = :trangThai
        AND function('date', h.ngayTao) = :ngay
    """)
    List<HoaDon> TimHoaDonTheoTrangThai(

        @Param("trangThai")
        TrangThaiHoaDon trangThai,

        @Param("ngay")
        LocalDate ngay
    );


    // ==========================================================
    // TÍNH DOANH THU TRONG KHOẢNG THỜI GIAN
    // ==========================================================

    @Query("""
        SELECT COALESCE(
            SUM(h.tongTien),
            0
        )
        FROM HoaDon h
        WHERE h.trangThai = :trangThai
        AND h.ngayTao >= :startDate
        AND h.ngayTao < :endDate
    """)
    BigDecimal calculateRevenueBetween(

        @Param("trangThai")
        TrangThaiHoaDon trangThai,

        @Param("startDate")
        LocalDateTime startDate,

        @Param("endDate")
        LocalDateTime endDate
    );
}