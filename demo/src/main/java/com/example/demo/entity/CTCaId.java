package com.example.demo.entity;


import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CTCaId implements Serializable{
    @Column(name = "cl_id")
    private Integer caLam;

    @Column(name = "nv_id")
    private Integer nhanVien;
}
