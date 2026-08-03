package com.example.demo.controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.dto.SanPhamDTO;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.example.demo.service.SanPhamService;


@RestController
@RequestMapping("/api/sanpham")
@CrossOrigin("*")
public class SanPhamcontroller {
     @Autowired 
     private SanPhamService sanPhamService;

     //tinh nang lay danh sach tat ca san pham, them tinh nang lay san pham theo id, them san pham, sua san pham, xoa san pham
     @GetMapping
     public ResponseEntity<List<SanPhamDTO>> getAllSanPham(){
          List<SanPhamDTO> sanPhams = sanPhamService.getAllSanPham();
          return ResponseEntity.ok(sanPhams);
     }

     @GetMapping("/{id}")
     public ResponseEntity<SanPhamDTO> getSanPhamById(@PathVariable Integer id){
          SanPhamDTO sanPham = sanPhamService.getSanPhamById(id);
          return ResponseEntity.ok(sanPham);
     }

     @PostMapping
     public ResponseEntity<SanPhamDTO> createSanPham(@RequestBody SanPhamDTO sanPhamDTO){
          return ResponseEntity.status(HttpStatus.CREATED).body(sanPhamService.createSanPham(sanPhamDTO));
     }

     @PutMapping("/{id}")
     public ResponseEntity<SanPhamDTO> updateSanPham(@PathVariable Integer id, @RequestBody SanPhamDTO sanPhamDTO){
          return ResponseEntity.ok(sanPhamService.updateSanPhamDTO(id, sanPhamDTO));
     }

     @DeleteMapping("/{id}")
     public ResponseEntity<SanPhamDTO> deleteSanPham(@PathVariable Integer id){
          return ResponseEntity.ok(sanPhamService.getSanPhamById(id));
     }

     //tinh nang tim kiem san pham theo ten, theo loai, theo ten va loai
     @GetMapping("/search")
     public ResponseEntity<List<SanPhamDTO>> TimKiemSanPhamTheoTen(@RequestParam String tenSP){
          List<SanPhamDTO> sanPhams = sanPhamService.TimKiemSanPhamTheoTen(tenSP);
          return ResponseEntity.ok(sanPhams);
     }
     
     @GetMapping("/searchByLoai")
     public ResponseEntity<List<SanPhamDTO>> TimSanPhamTheoLoaiSP(@RequestParam String loai){
          List<SanPhamDTO> sanPhams = sanPhamService.TimSanPhamTheoLoaiSP(loai);
          return ResponseEntity.ok(sanPhams);
     }

     @GetMapping("/searchByLoaiAndTen")
     public ResponseEntity<List<SanPhamDTO>> TimSanPhamTheoLoaiSPvaTenSP(@RequestParam String loai, @RequestParam String tenSP){
          List<SanPhamDTO> sanPhams = sanPhamService.TimSanPhamTheoLoaiSPvaTenSP(loai, tenSP);
          return ResponseEntity.ok(sanPhams);
     }

     @GetMapping("/searchByTenAndLoai")
     public ResponseEntity<List<SanPhamDTO>> TimSanPhamTheoTenSPvaLoaiSP(@RequestParam String tenSP, @RequestParam String loai){
          List<SanPhamDTO> sanPhams = sanPhamService.TimSanPhamTheoLoaiSPvaTenSP(loai, tenSP);
          return ResponseEntity.ok(sanPhams);
     }
}
