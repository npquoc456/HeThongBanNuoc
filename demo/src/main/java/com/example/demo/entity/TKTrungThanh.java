package com.example.demo.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tk_trung_thanh")
@Data
public class TKTrungThanh {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "ten_kh")
    private String tenKH;

    @Column(name = "so_luong_mua")
    private int soLuongMua;

    @Column(name = "ngay_tao")
    private LocalDate ngayTao;

}
