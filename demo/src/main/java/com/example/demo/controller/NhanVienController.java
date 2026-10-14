package com.example.demo.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<?> DangNhap(@RequestBody LoginRequest request) {
        System.out.println("=== DEBUG LOGIN ===");
        System.out.println("ID nhận được: [" + request.getId() + "]");
        System.out.println("Mật khẩu nhận được: [" + request.getMatKhau() + "]");

        try {
            NhanVienDTO nvDTO = nhanVienService.DangNhap(request.getId(), request.getMatKhau());
            return ResponseEntity.ok(nvDTO);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<NhanVienDTO>> getAllNhanVien() {
        return ResponseEntity.ok(nhanVienService.getAllNhanVien());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanVienDTO> getNhanVienById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(nhanVienService.getNhanVienById(id));
    }

    @PostMapping
    public ResponseEntity<NhanVienDTO> createNhanVien(@RequestBody NhanVienDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(nhanVienService.createNhanVien(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NhanVienDTO> updateNhanVien(@PathVariable("id") Integer id, @RequestBody NhanVienDTO dto) {
        return ResponseEntity.ok(nhanVienService.updateNhanVien(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNhanVien(@PathVariable("id") Integer id) {
        nhanVienService.deleteNhanVien(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<NhanVienDTO>> searchNhanVien(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(nhanVienService.timKiemNhanVien(keyword));
    }
}