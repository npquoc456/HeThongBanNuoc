package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "tktrungthanh")
public class TKTrungThanh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ten_kh")
    private String tenKH;

    @Column(name = "so_luong_mua")
    private Integer soLuongMua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

}