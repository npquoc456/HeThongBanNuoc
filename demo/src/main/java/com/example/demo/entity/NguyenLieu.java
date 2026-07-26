package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.LinkedHashSet;

import com.example.demo.constant.TrangThaiVatLieu;
import java.util.Set;



@Entity
@Table(name = "nguyenlieu")
@Data
public class NguyenLieu {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_nguyen_lieu")
    private String tenNguyenLieu;

    @Column(name = "don_vi_tinh")
    private String donViTinh;

    @Column(name = "so_luong")
    private Double soLuong;

    @Column(name = "don_vi")
    private String donVi;

    @Column(name ="trang_thai")
    private TrangThaiVatLieu trangThai;

    @OneToMany(mappedBy = "nguyenLieu")
    private Set<CTNL> ctnls = new LinkedHashSet<>();
}