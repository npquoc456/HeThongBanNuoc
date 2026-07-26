package com.example.demo.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ctnl")
@Data
public class CTNL {

    @EmbeddedId
    private CTNLId id;

    @MapsId("sanPham")
    @ManyToOne
    @JoinColumn(name = "san_pham_id", referencedColumnName = "id")
    private SanPham sanPham;

    @MapsId("nguyenLieu")
    @ManyToOne
    @JoinColumn(name = "nguyen_lieu_id", referencedColumnName = "id")
    private NguyenLieu nguyenLieu;

    private Double soLuong;
}