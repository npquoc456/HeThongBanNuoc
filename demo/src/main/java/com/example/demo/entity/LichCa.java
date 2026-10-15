package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "lich_ca")
public class LichCa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "nhan_vien_id", nullable = false)
    private NhanVien nhanVien;

    @Column(name = "ngay_lam", nullable = false)
    private LocalDate ngayLam;

    @Column(name = "ten_ca", nullable = false, length = 50)
    private String tenCa;

    @Column(name = "thoi_gian_bd", nullable = false, length = 5)
    private String thoiGianBD;

    @Column(name = "thoi_gian_kt", nullable = false, length = 5)
    private String thoiGianKT;
}
