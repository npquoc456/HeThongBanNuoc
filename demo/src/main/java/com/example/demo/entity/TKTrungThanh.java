package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tktrungthanh")
@Data
public class TKTrungThanh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "tenKH")
    private String tenKH;

    @Column(name = "soLuongMua")
    private Integer soLuongMua;

    @Column(name = "ngayTao")
    private LocalDate ngayTao;

}
