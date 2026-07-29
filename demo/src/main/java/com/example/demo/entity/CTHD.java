package com.example.demo.entity;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "cthd")
public class CTHD {

    @EmbeddedId
    private CTHDid id;

    @MapsId("hoaDonId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hd_id")
    @JsonIgnore
    private HoaDon hoaDon;

    @MapsId("sanPhamId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sp_id")
    private SanPham sanPham;

    @Column(name = "so_luong")
    private Integer soLuong;

    @NotNull
    @Column(name = "don_gia", precision = 10, scale = 2)
    private BigDecimal donGia;

}