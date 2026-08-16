package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;


import com.example.demo.dto.HoaDonDTO;
import com.example.demo.service.HoaDonService;

@RestController
@RequestMapping("/api/hoadon")
@CrossOrigin("*")
public class HoaDoncontroller {
    @Autowired 
    private HoaDonService hoaDonService;

    @GetMapping
    public ResponseEntity<List<HoaDonDTO>> getAllHoaDon(){
        try {
            System.out.println("[HoaDoncontroller] GET /api/hoadon called");
            List<HoaDonDTO> hoaDons = hoaDonService.getAllHoaDon();
            System.out.println("[HoaDoncontroller] returning " + (hoaDons==null?0:hoaDons.size()) + " invoices");
            return ResponseEntity.ok(hoaDons);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonDTO> getHoaDonById(@PathVariable Integer id){
        try {
            System.out.println("[HoaDoncontroller] GET /api/hoadon/" + id + " called");
            HoaDonDTO hoaDon = hoaDonService.getHoaDonById(id);
            return ResponseEntity.ok(hoaDon);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(404).build();
        }
    }

    @PostMapping
    public ResponseEntity<HoaDonDTO> createHoaDon(@RequestBody HoaDonDTO hoaDonDTO){
        try {
            System.out.println("[HoaDoncontroller] POST /api/hoadon payload: " + hoaDonDTO);
            HoaDonDTO created = hoaDonService.createHoaDon(hoaDonDTO);
            System.out.println("[HoaDoncontroller] created id: " + (created==null? "null": created.getId()));
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }  


    @PutMapping("/{id}")
    public ResponseEntity<HoaDonDTO> updateHoaDon(@PathVariable Integer id, @RequestBody HoaDonDTO hoaDonDTO){
        HoaDonDTO updatedHoaDon = hoaDonService.updateHoaDon(id, hoaDonDTO);
        return ResponseEntity.ok(updatedHoaDon);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHoaDon(@PathVariable Integer id){
        hoaDonService.deleteHoaDon(id);
        return ResponseEntity.noContent().build();
    }

}
