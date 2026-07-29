package com.example.demo.entity;

import com.example.demo.constant.TrangThaiVatLieu;
import jakarta.persistence.*;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "nguyenlieu")
public class NguyenLieu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_nl")
    private String tenNL;

    @Column(name = "so_luong")
    private Double soLuong;

    @Column(name = "don_vi")
    private String donVi;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThaiVatLieu trangThai;

    @OneToMany(mappedBy = "nguyenLieu",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private Set<CTNL> ctnls = new LinkedHashSet<>();

}