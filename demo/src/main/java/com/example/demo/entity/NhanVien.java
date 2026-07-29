package com.example.demo.entity;

import com.example.demo.constant.TrangThaiLamViec;
import com.example.demo.constant.VaiTro;
import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
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
    @Column(name = "matKhau")
    private String matkhau;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "vaitro")
    private VaiTro vaiTro;

    @NotNull
    @Column(name = "ngaySinh")
    private String ngaySinh;

    @Column(name = "ngayVao")
    private String ngayLamviec;

    @NotNull
    @Enumerated(EnumType.STRING)

    @Column(name = "trangThai") //chua them
    private TrangThaiLamViec trangThaiLamViec;

    @OneToMany(mappedBy = "nhanVien", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTCa> ctCa = new LinkedHashSet<>();
}
