package com.example.demo.entity;

import com.example.demo.constant.VaiTro;
import jakarta.persistence.*;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

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

    @ManyToOne
    @JoinColumn(name = "ca_lam_id", referencedColumnName = "id")
    private CaLam caLamviec;
}
