package com.example.demo.dto;

import java.math.BigDecimal;
import java.util.List;


public class DashboardResponseDTO {

    private double doanhThuTuanNay;

    private double doanhThuTuanTruoc;

    private double tangTruongDoanhThu;

    private List<TopProductDTO>
        topSanPhamBanChay;

    private List<Integer>
        bieuDoSoLuongTheoTuan;

    private List<BigDecimal>
        bieuDoDoanhThuTheoTuan;

    private List<String>
        labels;


    public DashboardResponseDTO() {
    }


    public double getDoanhThuTuanNay() {

        return doanhThuTuanNay;
    }


    public void setDoanhThuTuanNay(
        double value
    ) {

        this.doanhThuTuanNay =
            value;
    }


    public double getDoanhThuTuanTruoc() {

        return doanhThuTuanTruoc;
    }


    public void setDoanhThuTuanTruoc(
        double value
    ) {

        this.doanhThuTuanTruoc =
            value;
    }


    public double getTangTruongDoanhThu() {

        return tangTruongDoanhThu;
    }


    public void setTangTruongDoanhThu(
        double value
    ) {

        this.tangTruongDoanhThu =
            value;
    }


    public List<TopProductDTO>
    getTopSanPhamBanChay() {

        return topSanPhamBanChay;
    }


    public void setTopSanPhamBanChay(
        List<TopProductDTO> value
    ) {

        this.topSanPhamBanChay =
            value;
    }


    public List<Integer>
    getBieuDoSoLuongTheoTuan() {

        return bieuDoSoLuongTheoTuan;
    }


    public void setBieuDoSoLuongTheoTuan(
        List<Integer> value
    ) {

        this.bieuDoSoLuongTheoTuan =
            value;
    }


    public List<BigDecimal>
    getBieuDoDoanhThuTheoTuan() {

        return bieuDoDoanhThuTheoTuan;
    }


    public void setBieuDoDoanhThuTheoTuan(
        List<BigDecimal> value
    ) {

        this.bieuDoDoanhThuTheoTuan =
            value;
    }


    public List<String>
    getLabels() {

        return labels;
    }


    public void setLabels(
        List<String> value
    ) {

        this.labels =
            value;
    }
}