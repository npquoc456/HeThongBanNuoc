package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "calam")
public class CaLam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_ca")
    private String tenCa;

    @Column(name = "thoi_gian_bd")
    private String thoiGianBD;

    @Column(name = "thoi_gian_kt")
    private String thoiGianKT;

    @OneToMany(
            mappedBy = "caLam",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<CTCa> ctCa = new LinkedHashSet<>();

}