package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CaLamDTO {
    private int id; 
    private String tenCa;
    private String thoiGianBD;
    private String thoiGianKT;

    private List<CTCaDTO> ctCaList;
}
