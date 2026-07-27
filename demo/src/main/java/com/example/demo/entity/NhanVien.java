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
@Table(name = "nhan_vien")
public class NhanVien {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotNull
    private String hoTen;

    @NotNull
    private String email;

    @NotNull
    private String sdt;
    
    @NotNull
    private String matkhau;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    private VaiTro vaiTro;

    @NotNull
    private String ngaySinh;

    private String ngayLamviec;

    @NotNull
    @Enumerated(EnumType.STRING)
    private TrangThaiLamViec trangThaiLamViec;

    @OneToMany(mappedBy = "nhanVien", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CTCa> ctCa = new LinkedHashSet<>();
}
