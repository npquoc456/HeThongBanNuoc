package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ctnl")
public class CTNL {

    @EmbeddedId
    private CTNLId id;

    @MapsId("sanPhamId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sp_id")
    private SanPham sanPham;

    @MapsId("nguyenLieuId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nl_id")
    private NguyenLieu nguyenLieu;

    @Column(name = "so_luong_can")
    private Double soLuong;

}