package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NguyenLieuDTO;
import com.example.demo.service.NguyenLieuService;

@RestController
@RequestMapping("/api/nguyenlieu")
@CrossOrigin("*")
public class NguyenLieuController { // Đã sửa tên class viết hoa chữ C cho đúng chuẩn

    @Autowired 
    private NguyenLieuService nguyenLieuService; 

    // Lấy danh sách toàn bộ nguyên liệu
    @GetMapping
    public ResponseEntity<List<NguyenLieuDTO>> getAllNguyenLieu(){
        List<NguyenLieuDTO> nguyenLieus = nguyenLieuService.getAllNguyenLieu();
        return ResponseEntity.ok(nguyenLieus);
    }

    // Lấy thông tin 1 nguyên liệu theo ID
    @GetMapping("/{id}")
    public ResponseEntity<NguyenLieuDTO> getNguyenLieuById(@PathVariable("id") Integer id) {
        NguyenLieuDTO nguyenLieu = nguyenLieuService.getNguyenLieuById(id);
        return ResponseEntity.ok(nguyenLieu);
    }

    // Thêm mới nguyên liệu
    @PostMapping
    public ResponseEntity<NguyenLieuDTO> createNguyenLieu(@RequestBody NguyenLieuDTO dto) {
        NguyenLieuDTO created = nguyenLieuService.createNguyenLieu(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Sửa thông tin nguyên liệu
    @PutMapping("/{id}")
    public ResponseEntity<NguyenLieuDTO> updateNguyenLieu(@PathVariable("id") Integer id, @RequestBody NguyenLieuDTO dto) {
        NguyenLieuDTO updated = nguyenLieuService.updateNguyenLieuDTO(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Xóa nguyên liệu
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNguyenLieu(@PathVariable("id") Integer id) {
        try {
            nguyenLieuService.deleteNguyenLieu(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of("message", "Không thể xóa nguyên liệu vì còn dữ liệu liên quan."));
        }
    }
    
}