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
public class CTNLId implements Serializable {

    @Column(name = "sp_id")
    private Integer sanPhamId;

    @Column(name = "nl_id")
    private Integer nguyenLieuId;

}