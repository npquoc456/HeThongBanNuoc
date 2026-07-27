package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "ca_lam")
@Data
public class CaLam {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String tenCa;
    private String thoiGianBD;
    private String thoiGianKT;

    @OneToMany(mappedBy = "caLam", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTCa> ctCa = new LinkedHashSet<>();
}
