package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ctca")
@Data
public class CTCa {
    @Id
    @EmbeddedId
    private CTCaId id;

    @ManyToOne
    @MapsId("caLam")
    @JoinColumn(name = "cl_id", referencedColumnName = "id")
    private CaLam caLam;

    @ManyToOne
    @MapsId("nhanVien")
    @JoinColumn(name = "nv_id", referencedColumnName = "id")
    private NhanVien nhanVien;
 
}
