package com.example.demo.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class CTCaId implements Serializable {

    @Column(name = "cl_id")
    private Integer caLamId;

    @Column(name = "nv_id")
    private Integer nhanVienId;

}