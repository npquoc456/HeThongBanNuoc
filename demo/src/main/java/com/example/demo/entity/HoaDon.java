package com.example.demo.entity;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import com.example.demo.constant.TrangThaiHoaDon;
import java.util.LinkedHashSet;
import java.util.Set;
import com.example.demo.constant.PhuongThucThanhToan;

@Entity
@Table(name = "hoadon")
@Data
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "nhan_vien_id", referencedColumnName = "id")
    private NhanVien nhanVien;


    @ManyToOne
    @JoinColumn(name = "tk_trung_thanh_id", referencedColumnName = "id")
    private TKTrungThanh tkTrungThanh;


    @Column(name = "Tong_tien", precision = 12, scale = 2)    
    private BigDecimal tongTien;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThaiHoaDon trangThai;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Enumerated(EnumType.STRING)
    @Column(name = "phuong_thuc_thanh_toan")
    private PhuongThucThanhToan phuongThucThanhToan;

    @OneToMany(mappedBy = "hoaDon", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTHD> CTHDs = new LinkedHashSet<>();
}
