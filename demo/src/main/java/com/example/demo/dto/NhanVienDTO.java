package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.demo.constant.VaiTro;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhanVienDTO {
    private int id;
    private String tenNhanVien;
    private String email;
    private String sdt;

    private VaiTro vaiTro;

    private List<CTCaDTO> ctCaList;
}
