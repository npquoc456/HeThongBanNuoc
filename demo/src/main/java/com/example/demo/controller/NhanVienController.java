package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody; // ĐÂY CHÍNH LÀ THƯ VIỆN QUYẾT ĐỊNH
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.NhanVienDTO;
import com.example.demo.service.NhanVienService;

@RestController
@RequestMapping("/api/nhanvien")
@CrossOrigin("*")
public class NhanVienController {

    @Autowired
    private NhanVienService nhanVienService;

    @PostMapping("/login")
    public ResponseEntity<?> DangNhap(@RequestBody LoginRequest request){
        
        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("ID nhận được: [" + request.getId() + "]");
        System.out.println("Mật khẩu nhận được: [" + request.getMatKhau() + "]");

        try{
            NhanVienDTO nvDTO = nhanVienService.DangNhap(request.getId(), request.getMatKhau());
            return ResponseEntity.ok(nvDTO);
        }
        catch(RuntimeException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}