package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}
