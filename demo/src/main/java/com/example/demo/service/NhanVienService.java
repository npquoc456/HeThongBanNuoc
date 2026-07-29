package com.example.demo.service;

import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.NhanVien;
import com.example.demo.repository.NhanVienRepository;

@Service
public class NhanVienService {
    @Autowired 
    private NhanVienRepository nhanVienRepository;
    
    public NhanVien DangNhap(Integer id, String matkhau){
        Optional<NhanVien> nhanVien = nhanVienRepository.TimNhanVienTheoIDvaMK(id, matkhau);
        if(nhanVien.isPresent()){
            return nhanVien.get();
        }
        else{
            throw new RuntimeException("Đăng Nhập Thất Bại: Sai ID hoặc Mật khẩu");
        }
    }

}
