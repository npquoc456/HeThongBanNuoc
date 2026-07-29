package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class CTHDid implements Serializable {
    @Column(name = "hd_id")
    private Integer hoaDon;

    @Column(name = "sp_id")
    private Integer sanPham;   
}
