package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTHDDTO {
    private int hoaDonId;
    private int sanPhamId;
    private String tenSanPham;
    private int soLuong;

    private BigDecimal donGia;
}
