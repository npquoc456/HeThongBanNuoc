package com.example.demo.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TKTrungThanhDTO {
    private int id;
    private String tenKH; 
    private int soLuongMua; 
    private LocalDate ngayTao;
}
