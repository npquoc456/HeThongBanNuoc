package com.example.demo.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "hoadon")
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "nv_id", referencedColumnName = "id")
    private NhanVien nhanVien;

    @ManyToOne
    @JoinColumn(name = "kh_id", referencedColumnName = "id")
    private TKTrungThanh tkTrungThanh;

    @Column(name = "tong_hd", precision = 12, scale = 2)
    private BigDecimal tongTien;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThaiHoaDon trangThai;

    @Column(name = "ngay_hd")
    private LocalDateTime ngayTao;

    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc")
    private PhuongThucThanhToan phuongThucThanhToan;

    @OneToMany(
            mappedBy = "hoaDon",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Set<CTHD> cthds = new LinkedHashSet<>();

}