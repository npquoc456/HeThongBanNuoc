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
    private String tenNL;


    @Column(name = "soLuong")
    private Double soLuong;

    @Column(name = "donvi")
    private String donVi;

    @Enumerated(EnumType.STRING)
    @Column(name ="trangthai")
    private TrangThaiVatLieu trangThai;

    @OneToMany(mappedBy = "nguyenLieu")
    private Set<CTNL> ctnls = new LinkedHashSet<>();
}