package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "sanpham")
public class SanPham {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_sp")
    private String tenSP;

    @Column(name = "gia")
    private Double gia;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "loai")
    private String loai;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTHD> cthds = new LinkedHashSet<>();

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTNL> ctnls = new LinkedHashSet<>();

}