package com.example.demo.controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.dto.SanPhamDTO;
import java.util.List;


import com.example.demo.service.SanPhamService;

@RestController
@RequestMapping("/api/sanpham")
@CrossOrigin("*")
public class SanPhamcontroller {
     @Autowired 
     private SanPhamService sanPhamService;

     @GetMapping
     public ResponseEntity<List<SanPhamDTO>> getAllSanPham(){
          List<SanPhamDTO> sanPhams = sanPhamService.getAllSanPham();
          return ResponseEntity.ok(sanPhams);
     }
}
