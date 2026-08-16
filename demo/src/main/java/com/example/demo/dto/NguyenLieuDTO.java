package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.constant.TrangThaiVatLieu;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NguyenLieuDTO {
    private int id;
    private String tenNL;
    private String donVi;
    private double soLuong;
    private TrangThaiVatLieu trangThai;
}
