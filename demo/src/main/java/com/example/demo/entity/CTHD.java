package com.example.demo.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "cthd")
@Data
public class CTHD {
    @Id
    @EmbeddedId
    private CTHDid id;

    @ManyToOne
    @MapsId("hoaDon")
    @JoinColumn(name = "hoa_don_id", referencedColumnName = "id")
    @JsonIgnore 
    private HoaDon hoaDon;
    
    @ManyToOne
    @MapsId("sanPham")
    @JoinColumn(name = "san_pham_id", referencedColumnName = "id")
    private SanPham sanPham;

    @Column(name = "so_luong")
    private int soLuong;

    @NotNull
    @Column(name = "don_gia", precision = 10, scale = 2)
    private BigDecimal donGia;
}
