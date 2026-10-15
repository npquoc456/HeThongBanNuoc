package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamDTO {
    private int id;
    private String tenSP; 
    private double giaSP; 
    private String moTa;
    private String loaiSP;
    private String hinhAnh;

    private List<CTHDDTO> cthdList;
    private List<SanPhamNguyenLieuDTO> nguyenLieus;
}
