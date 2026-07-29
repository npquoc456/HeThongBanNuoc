package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CTHDid implements Serializable {

    @Column(name = "hd_id")
    private Integer hoaDonId;

    @Column(name = "sp_id")
    private Integer sanPhamId;

}