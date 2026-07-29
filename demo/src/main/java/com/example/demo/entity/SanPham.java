package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "sanpham")
@Data   
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tensp")
    private String tenSP;

    @Column(name = "gia")
    private Double giaSP;

    @Column(name = "moTa")
    private String moTa;

    @Column(name = "loai")
    private String loaiSP;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTHD> CTHDs = new LinkedHashSet<>();
    
    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTNL> CTNLs = new LinkedHashSet<>();

}
