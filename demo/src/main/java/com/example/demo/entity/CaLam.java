package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "calam")
@Data
public class CaLam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tenCa")
    private String tenCa;

    @Column(name = "thoiGianBD")
    private String thoiGianBD;

    @Column(name = "thoiGianKT")
    private String thoiGianKT;

    @OneToMany(mappedBy = "caLam", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTCa> ctCa = new LinkedHashSet<>();
}
