package com.example.demo.controller;

import com.example.demo.dto.KetCaDTO;
import com.example.demo.dto.KetCaRequestDTO;
import com.example.demo.service.KetCaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/ketca")
@CrossOrigin("*")
public class KetCaController {

    private final KetCaService ketCaService;

    public KetCaController(KetCaService ketCaService) {
        this.ketCaService = ketCaService;
    }

    @GetMapping("/current-shift")
    public ResponseEntity<?> getCurrentShift(
            @RequestParam("staffId") Integer staffId,
            @RequestParam("startedAt") LocalDateTime startedAt) {
        try {
            return ResponseEntity.ok(ketCaService.getCurrentShift(staffId, startedAt));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<KetCaDTO>> getHistory() {
        return ResponseEntity.ok(ketCaService.getHistory());
    }

    @PostMapping
    public ResponseEntity<?> closeShift(@RequestBody KetCaRequestDTO request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ketCaService.closeShift(request));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }
}
