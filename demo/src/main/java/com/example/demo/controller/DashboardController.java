package com.example.demo.controller;

import com.example.demo.dto.WeeklyStatsDTO;
import com.example.demo.service.DashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {


    @Autowired
    private DashboardService dashboardService;


    // ==========================================================
    // DASHBOARD SUMMARY
    // ==========================================================

    @GetMapping
    public ResponseEntity<Map<String, Object>>
    getDashboardSummary() {


        Map<String, Object> summary =
                new HashMap<>();


        WeeklyStatsDTO weeklyStats =
                dashboardService.getWeeklyStats();


        // =====================================================
        // DOANH THU 7 NGÀY HIỆN TẠI
        // =====================================================

        BigDecimal currentRevenue =
                weeklyStats.getRevenues() == null

                    ? BigDecimal.ZERO

                    : weeklyStats
                        .getRevenues()
                        .stream()
                        .reduce(
                            BigDecimal.ZERO,
                            BigDecimal::add
                        );


        // =====================================================
        // DOANH THU 7 NGÀY TRƯỚC ĐÓ
        // =====================================================

        BigDecimal previousRevenue =
                dashboardService
                    .getPrevious7DaysRevenue();


        // =====================================================
        // GROWTH
        // =====================================================

        BigDecimal growth =
                BigDecimal.ZERO;


        if (
            previousRevenue.compareTo(
                BigDecimal.ZERO
            ) > 0
        ) {

            growth =
                currentRevenue
                    .subtract(
                        previousRevenue
                    )
                    .multiply(
                        BigDecimal.valueOf(
                            100
                        )
                    )
                    .divide(
                        previousRevenue,
                        2,
                        RoundingMode.HALF_UP
                    );

        } else if (
            currentRevenue.compareTo(
                BigDecimal.ZERO
            ) > 0
        ) {

            growth =
                BigDecimal.valueOf(
                    100
                );
        }


        // =====================================================
        // TOP 5
        // =====================================================

        List<Map<String, Object>> topProducts =

            weeklyStats.getTopProducts() == null

                ? List.of()

                : weeklyStats
                    .getTopProducts()
                    .stream()
                    .map(
                        item -> {

                            Map<String, Object> product =
                                new HashMap<>();


                            product.put(
                                "sanPhamId",
                                item.getSanPhamId()
                            );


                            product.put(
                                "tenSanPham",
                                item.getTenSanPham()
                            );


                            product.put(
                                "soLuongBan",
                                item.getSoLuong()
                            );


                            return product;
                        }
                    )
                    .collect(
                        Collectors.toList()
                    );


        // =====================================================
        // WIDGET
        // =====================================================

        summary.put(
            "doanhThuTuanNay",
            currentRevenue.doubleValue()
        );


        summary.put(
            "doanhThuTuanTruoc",
            previousRevenue.doubleValue()
        );


        summary.put(
            "tangTruongDoanhThu",
            growth.doubleValue()
        );


        // =====================================================
        // 7 NGÀY
        // =====================================================

        summary.put(
            "labels",
            weeklyStats.getLabels()
        );


        summary.put(
            "bieuDoSoLuongTheoTuan",
            weeklyStats.getQuantities()
        );


        summary.put(
            "bieuDoDoanhThuTheoTuan",
            weeklyStats.getRevenues()
        );


        // =====================================================
        // TOP 5
        // =====================================================

        summary.put(
            "topSanPhamBanChay",
            topProducts
        );


        return ResponseEntity.ok(
            summary
        );
    }


    // ==========================================================
    // WEEKLY DATA
    // ==========================================================

    @GetMapping("/weekly")
    public ResponseEntity<WeeklyStatsDTO>
    getWeeklyStats() {

        return ResponseEntity.ok(
            dashboardService.getWeeklyStats()
        );
    }
}