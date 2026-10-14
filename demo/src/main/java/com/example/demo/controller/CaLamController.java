package com.example.demo.controller;

import com.example.demo.dto.CTCaDTO;
import com.example.demo.dto.CaLamDTO;
import com.example.demo.service.CaLamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calam")
@CrossOrigin("*")
public class CaLamController {

    @Autowired
    private CaLamService caLamService;

    @GetMapping
    public ResponseEntity<List<CaLamDTO>> getAllCaLam() {
        return ResponseEntity.ok(caLamService.getAllCaLam());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaLamDTO> getCaLamById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(caLamService.getCaLamById(id));
    }

    @PostMapping
    public ResponseEntity<CaLamDTO> createCaLam(@RequestBody CaLamDTO caLamDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caLamService.createCaLam(caLamDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaLamDTO> updateCaLam(@PathVariable("id") Integer id, @RequestBody CaLamDTO caLamDTO) {
        return ResponseEntity.ok(caLamService.updateCaLam(id, caLamDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCaLam(@PathVariable("id") Integer id) {
        caLamService.deleteCaLam(id);
        return ResponseEntity.noContent().build();
    }

    // Gán ca làm cho nhân viên
    @PostMapping("/{caLamId}/phancong/{nhanVienId}")
    public ResponseEntity<CTCaDTO> phanCongCa(
            @PathVariable("caLamId") Integer caLamId,
            @PathVariable("nhanVienId") Integer nhanVienId) {
        return ResponseEntity.ok(caLamService.phanCongCa(caLamId, nhanVienId));
    }

    // Hủy ca làm của nhân viên
    @DeleteMapping("/{caLamId}/phancong/{nhanVienId}")
    public ResponseEntity<Void> xoaPhanCongCa(
            @PathVariable("caLamId") Integer caLamId,
            @PathVariable("nhanVienId") Integer nhanVienId) {
        caLamService.xoaPhanCongCa(caLamId, nhanVienId);
        return ResponseEntity.noContent().build();
    }
}