package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ct_ca")
@Data
public class CTCa {
    @Id
    @EmbeddedId
    private CTCaId id;

    @ManyToOne
    @MapsId("caLam")
    @JoinColumn(name = "ca_lam_id", referencedColumnName = "id")
    private CaLam caLam;

    @ManyToOne
    @MapsId("nhanVien")
    @JoinColumn(name = "nhan_vien_id", referencedColumnName = "id")
    private NhanVien nhanVien;
}
