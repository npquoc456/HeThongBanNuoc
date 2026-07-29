package com.example.demo.entity;

import com.example.demo.constant.TrangThaiLamViec;
import com.example.demo.constant.VaiTro;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "nhanvien")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull
    @Column(name = "ten")
    private String hoTen;

    @NotNull
    @Column(name = "email")
    private String email;

    @NotNull
    @Column(name = "phone")
    private String sdt;

    @NotNull
    @Column(name = "mat_khau")
    private String matKhau;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro")
    private VaiTro vaiTro;

    @NotNull
    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "ngay_vao")
    private LocalDate ngayLamViec;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai")
    private TrangThaiLamViec trangThaiLamViec;

    @OneToMany(mappedBy = "nhanVien", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTCa> ctCa = new LinkedHashSet<>();

}