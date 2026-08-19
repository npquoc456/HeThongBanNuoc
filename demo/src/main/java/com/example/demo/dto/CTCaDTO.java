package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CTCaDTO {
    private int CaLamId;
    private int NhanVienId;
    private String tenCa;
    private String thoiGianBatDau;
    private String thoiGianKetThuc;
}
