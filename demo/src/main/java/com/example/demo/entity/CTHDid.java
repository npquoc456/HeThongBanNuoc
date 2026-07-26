package com.example.demo.entity;

import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class CTHDid implements Serializable {
    private Integer hoaDon;
    private Integer sanPham;   
}
