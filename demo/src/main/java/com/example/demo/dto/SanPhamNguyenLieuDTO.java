package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SanPhamNguyenLieuDTO {
    private Integer nguyenLieuId;
    private String tenNL;
    private String donVi;
    private Double soLuongCan;
}
