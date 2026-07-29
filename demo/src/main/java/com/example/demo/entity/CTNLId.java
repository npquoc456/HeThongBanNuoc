package com.example.demo.entity;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;

@Embeddable
public class CTNLId implements Serializable {
    @Column(name = "sp_id")
    private Integer sanPham;

    @Column(name = "nl_id")
    private Integer nguyenLieu;
}