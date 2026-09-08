package com.example.demo.service;

import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.dto.TopProductDTO;
import com.example.demo.dto.WeeklyStatsDTO;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.SanPham;
import com.example.demo.repository.CTHDReponsitory;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.SanPhamRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import java.util.stream.Collectors;


@Service
public class DashboardService {


    @Autowired
    private HoaDonRepository hoaDonRepository;


    @Autowired
    private SanPhamRepository sanPhamRepository;


    @Autowired
    private CTHDReponsitory cthdReponsitory;


    // ==========================================================
    // 7 NGÀY GẦN NHẤT
    // ==========================================================

    public WeeklyStatsDTO getWeeklyStats() {


        LocalDate today =
                LocalDate.now();


        // ======================================================
        // 7 NGÀY
        //
        // today - 6
        // today - 5
        // ...
        // today
        // ======================================================

        LocalDate startDate =
                today.minusDays(6);


        LocalDate endDate =
                today;


        System.out.println(
            "======================================"
        );


        System.out.println(
            "DASHBOARD - 7 NGAY GAN NHAT"
        );


        System.out.println(
            "Start: "
            + startDate
        );


        System.out.println(
            "End  : "
            + endDate
        );


        System.out.println(
            "======================================"
        );


        // ======================================================
        // LABEL DD/MM
        // ======================================================

        List<String> labels =
                new ArrayList<>();


        for (
            int i = 0;
            i < 7;
            i++
        ) {


            LocalDate date =
                    startDate.plusDays(i);


            String label =
                    String.format(
                        "%02d/%02d",
                        date.getDayOfMonth(),
                        date.getMonthValue()
                    );


            labels.add(
                label
            );
        }


        // ======================================================
        // QUANTITIES
        // ======================================================

        List<Integer> quantities =
                new ArrayList<>(
                    Collections.nCopies(
                        7,
                        0
                    )
                );


        // ======================================================
        // REVENUES
        // ======================================================

        List<BigDecimal> revenues =
                new ArrayList<>(
                    Collections.nCopies(
                        7,
                        BigDecimal.ZERO
                    )
                );


        // ======================================================
        // PRODUCT COUNTS
        // ======================================================

        Map<Integer, Integer> productCounts =
                new HashMap<>();


        // ======================================================
        // ALL INVOICES
        // ======================================================

        List<HoaDon> invoices =
                hoaDonRepository.findAll();


        System.out.println(
            "Tong hoa don: "
            + invoices.size()
        );


        // ======================================================
        // DUYỆT HÓA ĐƠN
        // ======================================================

        for (
            HoaDon invoice :
            invoices
        ) {


            if (invoice == null) {
                continue;
            }


            // ==================================================
            // STATUS
            // ==================================================

            if (
                !isValidInvoiceStatus(
                    invoice
                        .getTrangThai()
                )
            ) {

                continue;
            }


            // ==================================================
            // CREATED TIME
            // ==================================================

            LocalDateTime createdAt =
                    invoice.getNgayTao();


            if (createdAt == null) {
                continue;
            }


            LocalDate invoiceDate =
                    createdAt.toLocalDate();


            // ==================================================
            // KHÔNG THUỘC 7 NGÀY
            // ==================================================

            if (
                invoiceDate.isBefore(
                    startDate
                )
                ||
                invoiceDate.isAfter(
                    endDate
                )
            ) {

                continue;
            }


            // ==================================================
            // INDEX
            //
            // startDate = 0
            // startDate + 1 = 1
            // ...
            // today = 6
            // ==================================================

            int index =
                (int)
                ChronoUnit.DAYS.between(
                    startDate,
                    invoiceDate
                );


            if (
                index < 0
                ||
                index > 6
            ) {

                continue;
            }


            // ==================================================
            // REVENUE
            // ==================================================

            BigDecimal invoiceTotal =
                    invoice.getTongTien() == null

                        ? BigDecimal.ZERO

                        : invoice.getTongTien();


            revenues.set(
                index,
                revenues
                    .get(index)
                    .add(
                        invoiceTotal
                    )
            );


            // ==================================================
            // CTHD
            //
            // Lấy trực tiếp từ repository.
            // Không phụ thuộc LazyLoading của h.getCthds()
            // ==================================================

            List<CTHD> details =
                    cthdReponsitory
                        .findByHoaDonId(
                            invoice.getId()
                        );


            // ==================================================
            // PRODUCT QUANTITY
            // ==================================================

            for (
                CTHD detail :
                details
            ) {


                if (detail == null) {
                    continue;
                }


                if (
                    detail.getSanPham()
                    == null
                ) {

                    continue;
                }


                Integer productId =
                        detail
                            .getSanPham()
                            .getId();


                if (productId == null) {
                    continue;
                }


                int quantity =
                        detail.getSoLuong() == null

                            ? 0

                            : detail.getSoLuong();


                if (quantity <= 0) {
                    continue;
                }


                // =================================================
                // SỐ LƯỢNG TRONG NGÀY
                // =================================================

                quantities.set(
                    index,

                    quantities.get(index)
                    + quantity
                );


                // =================================================
                // TOP 5
                // =================================================

                productCounts.put(
                    productId,

                    productCounts.getOrDefault(
                        productId,
                        0
                    ) + quantity
                );
            }
        }


        // ======================================================
        // SORT TOP PRODUCTS
        // ======================================================

        List<Map.Entry<Integer, Integer>>
            sortedProducts =

                productCounts
                    .entrySet()
                    .stream()
                    .sorted(
                        Map.Entry
                            .<Integer, Integer>
                            comparingByValue(
                                Comparator.reverseOrder()
                            )
                    )
                    .limit(5)
                    .collect(
                        Collectors.toList()
                    );


        // ======================================================
        // LẤY ID TOP 5
        // ======================================================

        List<Integer> topProductIds =
                sortedProducts
                    .stream()
                    .map(
                        Map.Entry::getKey
                    )
                    .collect(
                        Collectors.toList()
                    );


        // ======================================================
        // LẤY SẢN PHẨM
        // ======================================================

        Map<Integer, SanPham> productsMap =
                new HashMap<>();


        if (
            !topProductIds.isEmpty()
        ) {


            List<SanPham> products =
                    sanPhamRepository
                        .findAllById(
                            topProductIds
                        );


            productsMap =
                products
                    .stream()
                    .collect(
                        Collectors.toMap(
                            SanPham::getId,
                            product -> product
                        )
                    );
        }


        // ======================================================
        // TOP PRODUCT DTO
        // ======================================================

        final Map<Integer, SanPham>
            finalProductsMap =
                productsMap;


        List<TopProductDTO> topProducts =
                sortedProducts
                    .stream()
                    .map(
                        entry -> {

                            Integer productId =
                                entry.getKey();


                            Integer quantity =
                                entry.getValue();


                            SanPham product =
                                finalProductsMap
                                    .get(productId);


                            String productName =
                                product != null

                                    ? product.getTenSP()

                                    : "Sản phẩm";


                            return new TopProductDTO(
                                productId,
                                productName,
                                quantity
                            );
                        }
                    )
                    .collect(
                        Collectors.toList()
                    );


        // ======================================================
        // DEBUG
        // ======================================================

        System.out.println(
            "Labels     = "
            + labels
        );


        System.out.println(
            "Quantities = "
            + quantities
        );


        System.out.println(
            "Revenues   = "
            + revenues
        );


        System.out.println(
            "Top        = "
            + topProducts.size()
        );


        // ======================================================
        // DTO
        // ======================================================

        WeeklyStatsDTO dto =
                new WeeklyStatsDTO();


        dto.setLabels(
            labels
        );


        dto.setQuantities(
            quantities
        );


        dto.setRevenues(
            revenues
        );


        dto.setTopProducts(
            topProducts
        );


        return dto;
    }


    // ==========================================================
    // 7 NGÀY LIỀN TRƯỚC
    //
    // Ví dụ:
    //
    // Current:
    // 02/09 -> 08/09
    //
    // Previous:
    // 26/08 -> 01/09
    // ==========================================================

    public BigDecimal
    getPrevious7DaysRevenue() {


        LocalDate today =
                LocalDate.now();


        LocalDate previousStart =
                today.minusDays(13);


        LocalDate previousEnd =
                today.minusDays(7);


        BigDecimal total =
                BigDecimal.ZERO;


        List<HoaDon> invoices =
                hoaDonRepository.findAll();


        for (
            HoaDon invoice :
            invoices
        ) {


            if (invoice == null) {
                continue;
            }


            if (
                !isValidInvoiceStatus(
                    invoice
                        .getTrangThai()
                )
            ) {

                continue;
            }


            LocalDateTime createdAt =
                    invoice.getNgayTao();


            if (createdAt == null) {
                continue;
            }


            LocalDate date =
                    createdAt.toLocalDate();


            if (
                date.isBefore(
                    previousStart
                )
                ||
                date.isAfter(
                    previousEnd
                )
            ) {

                continue;
            }


            BigDecimal amount =
                    invoice.getTongTien() == null

                        ? BigDecimal.ZERO

                        : invoice.getTongTien();


            total =
                total.add(
                    amount
                );
        }


        return total;
    }


    // ==========================================================
    // STATUS HÓA ĐƠN
    // ==========================================================

    private boolean
    isValidInvoiceStatus(
        TrangThaiHoaDon status
    ) {


        return status ==
                    TrangThaiHoaDon.DA_THANH_TOAN

            ||

               status ==
                    TrangThaiHoaDon.DA_XAC_NHAN;
    }
}