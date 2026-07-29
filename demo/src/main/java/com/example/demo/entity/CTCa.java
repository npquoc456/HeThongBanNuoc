package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ctca")
public class CTCa {

    @EmbeddedId
    private CTCaId id;

    @MapsId("caLamId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cl_id")
    private CaLam caLam;

    @MapsId("nhanVienId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nv_id")
    private NhanVien nhanVien;

}