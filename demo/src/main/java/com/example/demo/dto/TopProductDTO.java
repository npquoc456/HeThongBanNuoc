package com.example.demo.dto;


public class TopProductDTO {

    private Integer sanPhamId;

    private String tenSanPham;

    private Integer soLuong;


    public TopProductDTO() {
    }


    public TopProductDTO(
        Integer sanPhamId,
        String tenSanPham,
        Integer soLuong
    ) {

        this.sanPhamId =
            sanPhamId;

        this.tenSanPham =
            tenSanPham;

        this.soLuong =
            soLuong;
    }


    public Integer getSanPhamId() {

        return sanPhamId;
    }


    public void setSanPhamId(
        Integer sanPhamId
    ) {

        this.sanPhamId =
            sanPhamId;
    }


    public String getTenSanPham() {

        return tenSanPham;
    }


    public void setTenSanPham(
        String tenSanPham
    ) {

        this.tenSanPham =
            tenSanPham;
    }


    public Integer getSoLuong() {

        return soLuong;
    }


    public void setSoLuong(
        Integer soLuong
    ) {

        this.soLuong =
            soLuong;
    }
}