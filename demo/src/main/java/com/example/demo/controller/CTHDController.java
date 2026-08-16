package com.example.demo.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import com.example.demo.dto.CTHDDTO;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.demo.service.CTHDService;


@RestController
@RequestMapping("/api/cthd")
@CrossOrigin("*")
public class CTHDController {
     @Autowired 
     private CTHDService cthdService;

     //tinh nang lay danh sach cthd theo hoa don, them cthd, sua cthd, xoa cthd
     @GetMapping("/hoadon/{hoaDonId}")
     public ResponseEntity<List<CTHDDTO>> getCTHDByHoaDonId(@PathVariable Integer hoaDonId){
          List<CTHDDTO> cthds = cthdService.getCTHDByHoaDonId(hoaDonId);
          return ResponseEntity.ok(cthds);
     }

     @PostMapping
     public ResponseEntity<CTHDDTO> createCTHD(@RequestBody CTHDDTO cthdDTO){
          return ResponseEntity.status(HttpStatus.CREATED).body(cthdService.createCTHD(cthdDTO));
     }

     @PutMapping("/{hoaDonId}/{sanPhamId}")
     public ResponseEntity<CTHDDTO> updateCTHD(@PathVariable Integer hoaDonId, @PathVariable Integer sanPhamId, @RequestBody CTHDDTO cthdDTO){
          return ResponseEntity.ok(cthdService.updateCTHD(hoaDonId, sanPhamId, cthdDTO));
     }

     @DeleteMapping("/{hoaDonId}/{sanPhamId}")
     public ResponseEntity<String> deleteCTHD(@PathVariable Integer hoaDonId, @PathVariable Integer sanPhamId){
          cthdService.deleteCTHD(hoaDonId, sanPhamId);
          return ResponseEntity.ok("Xóa chi tiết hóa đơn thành công!");
     }
}