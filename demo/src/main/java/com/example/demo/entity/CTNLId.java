package com.example.demo.entity;
import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class CTNLId implements Serializable {
    private Integer sanPham;
    private Integer nguyenLieu;
}