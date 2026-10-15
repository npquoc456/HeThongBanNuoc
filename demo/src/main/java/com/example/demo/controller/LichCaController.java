package com.example.demo.controller;

import com.example.demo.dto.LichCaDTO;
import com.example.demo.service.LichCaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/lichca")
@CrossOrigin("*")
public class LichCaController {
    private final LichCaService lichCaService;

    public LichCaController(LichCaService lichCaService) {
        this.lichCaService = lichCaService;
    }

    @GetMapping
    public ResponseEntity<List<LichCaDTO>> getSchedule(
            @RequestParam("startDate") LocalDate startDate,
            @RequestParam("endDate") LocalDate endDate) {
        return ResponseEntity.ok(lichCaService.getSchedule(startDate, endDate));
    }

    @PostMapping
    public ResponseEntity<LichCaDTO> create(@RequestBody LichCaDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lichCaService.create(dto));
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<LichCaDTO>> createAll(@RequestBody List<LichCaDTO> assignments) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lichCaService.createAll(assignments));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichCaDTO> update(
            @PathVariable("id") Integer id,
            @RequestBody LichCaDTO dto) {
        return ResponseEntity.ok(lichCaService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        lichCaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
