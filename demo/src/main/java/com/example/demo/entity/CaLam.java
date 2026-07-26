package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

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
}
