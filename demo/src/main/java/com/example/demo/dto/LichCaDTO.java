package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichCaDTO {
    private Integer id;
    private Integer nhanVienId;
    private String tenNhanVien;
    private LocalDate ngayLam;
    private String tenCa;
    private String thoiGianBD;
    private String thoiGianKT;
}
