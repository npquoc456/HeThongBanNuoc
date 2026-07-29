package com.example.demo.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ctnl")
@Data
public class CTNL {

    @Id
    @EmbeddedId
    private CTNLId id;

    @MapsId("sanPham")
    @ManyToOne
    @JoinColumn(name = "sp_id", referencedColumnName = "id")
    private SanPham sanPham;

    @MapsId("nguyenLieu")
    @ManyToOne
    @JoinColumn(name = "nl_id", referencedColumnName = "id")
    private NguyenLieu nguyenLieu;

    @Column(name = "soLuongCan")
    private Double soLuong;
}