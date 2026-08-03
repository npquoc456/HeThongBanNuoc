package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.NguyenLieuDTO;
import com.example.demo.service.NguyenLieuService;

@RestController
@RequestMapping("/api/nguyenlieu")
@CrossOrigin("*")
public class NguyenLieucontroller {
    @Autowired 
    private NguyenLieuService nguyenLieuService; 

    @GetMapping
    public ResponseEntity<List<NguyenLieuDTO>> getAllNguyenLieu(){
        List<NguyenLieuDTO> nguyenLieus = nguyenLieuService.getAllNguyenLieu();
        return ResponseEntity.ok(nguyenLieus);
    }
}
