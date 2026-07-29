package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.NhanVien;
import com.example.demo.service.NhanVienService;

@RestController
@RequestMapping("/apt/nhanvien")
@CrossOrigin("*")
public class NhanViencontroller {

    @Autowired
    private NhanVienService nhanVienService;

    @PostMapping("/login")
    public ResponseEntity<?> DangNhap(@RequestParam Integer id, @RequestParam String matkhau){
        try{
            NhanVien nv = nhanVienService.DangNhap(id, matkhau);
            return ResponseEntity.ok(nv);
        }

        catch(RuntimeException ex){
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

}
