package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody; // Quan trọng để nhận JSON
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import org.springframework.http.ResponseEntity;

import com.example.demo.service.TKTrungThanhService;
import com.example.demo.dto.TKTrungThanhDTO;

@RestController
@RequestMapping("/api/tktrungthanh")
@CrossOrigin("*")
public class TKTrungThanhcontroller {
    @Autowired 
    private TKTrungThanhService tkTrungThanhService; 

    @GetMapping
    public ResponseEntity<List<TKTrungThanhDTO>> getAllTkTrungThanh(){
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.getAllTkTrungThanh();
        return ResponseEntity.ok(tkTrungThanhList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TKTrungThanhDTO> getTKTrungThanhById(@PathVariable Integer id){
        TKTrungThanhDTO tkTrungThanhDTO = tkTrungThanhService.getTKTrungThanhById(id);
        return ResponseEntity.ok(tkTrungThanhDTO);
    }

    @PostMapping 
    public ResponseEntity<TKTrungThanhDTO> createTKTrungThanh(@RequestBody TKTrungThanhDTO dto){
        TKTrungThanhDTO createdTkTrungThanh = tkTrungThanhService.createTKTrungThanh(dto);
        return ResponseEntity.ok(createdTkTrungThanh);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TKTrungThanhDTO> updateTkTrungThanh(@PathVariable Integer id, @RequestBody TKTrungThanhDTO dto){
        TKTrungThanhDTO updatedTkTrungThanh = tkTrungThanhService.updatedTkTrungThanhDTO(id, dto);
        return ResponseEntity.ok(updatedTkTrungThanh);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTkTrungThanh(@PathVariable Integer id){
        tkTrungThanhService.deleteTkTrungThanh(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<TKTrungThanhDTO>> TimKiemTkTrungThanhTheoTen(@RequestParam String tenKH){
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.TimKiemTkTrungThanhTheoTen(tenKH);
        return ResponseEntity.ok(tkTrungThanhList);
    }

    @GetMapping("/searchByIdAndName")
    public ResponseEntity<List<TKTrungThanhDTO>> TimKiemTkTrungThanhTheoIDvaTen(@RequestParam Integer id, @RequestParam String tenKH){
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.TimKiemTkTrungThanhTheoIDvaTen(id, tenKH);
        return ResponseEntity.ok(tkTrungThanhList);
    }
}