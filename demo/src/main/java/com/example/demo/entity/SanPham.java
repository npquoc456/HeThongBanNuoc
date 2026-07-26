package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "san_pham")
@Data   
public class SanPham {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "ten_sp")
    private String tenSP;

    @Column(name = "gia_SP")
    private double giaSP;

    @Column(name = "mo_ta")
    private String moTa;

    @Column(name = "loai_sp")
    private String loaiSP;

    @OneToMany(mappedBy = "sanPham", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTNL> CTNLs = new LinkedHashSet<>();

}
