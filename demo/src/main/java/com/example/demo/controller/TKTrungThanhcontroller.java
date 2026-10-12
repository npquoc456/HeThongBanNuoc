package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
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
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.demo.service.TKTrungThanhService;
import com.example.demo.dto.TKTrungThanhDTO;

@RestController
@RequestMapping("/api/tktrungthanh")
@CrossOrigin("*")
public class TKTrungThanhcontroller {

    private static final Logger logger = LoggerFactory.getLogger(TKTrungThanhcontroller.class);

    @Autowired
    private TKTrungThanhService tkTrungThanhService;

    @GetMapping
    public ResponseEntity<List<TKTrungThanhDTO>> getAllTkTrungThanh() {
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.getAllTkTrungThanh();
        return ResponseEntity.ok(tkTrungThanhList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TKTrungThanhDTO> getTKTrungThanhById(@PathVariable("id") Integer id) {
        TKTrungThanhDTO tkTrungThanhDTO = tkTrungThanhService.getTKTrungThanhById(id);
        return ResponseEntity.ok(tkTrungThanhDTO);
    }

    @PostMapping
    public ResponseEntity<TKTrungThanhDTO> createTKTrungThanh(@RequestBody TKTrungThanhDTO dto) {
        TKTrungThanhDTO createdTkTrungThanh = tkTrungThanhService.createTKTrungThanh(dto);
        return ResponseEntity.ok(createdTkTrungThanh);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TKTrungThanhDTO> updateTkTrungThanh(@PathVariable("id") Integer id, @RequestBody TKTrungThanhDTO dto) {
        TKTrungThanhDTO updatedTkTrungThanh = tkTrungThanhService.updatedTkTrungThanhDTO(id, dto);
        return ResponseEntity.ok(updatedTkTrungThanh);
    }

    // Đã fix lỗi: Đưa về Integer id cho đồng bộ
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTkTrungThanh(@PathVariable("id") Integer id) {
        try {
            if (!tkTrungThanhService.deleteTkTrungThanh(id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(java.util.Map.of(
                                "message",
                                "Không thể xóa tài khoản này vì đã có hóa đơn."));
            }
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            logger.error("Không thể xóa tài khoản tích điểm {} do vi phạm ràng buộc dữ liệu", id, e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(java.util.Map.of(
                            "message",
                            "Không thể xóa tài khoản này vì đã có hóa đơn."));
        } catch (Exception e) {
            logger.error("Lỗi khi xóa tài khoản tích điểm {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(java.util.Map.of(
                            "message",
                            "Không thể xóa tài khoản tích điểm. Chi tiết lỗi đã được ghi vào log backend."));
        }   
    }

    @GetMapping("/search")
    public ResponseEntity<List<TKTrungThanhDTO>> TimKiemTkTrungThanhTheoTen(@RequestParam("tenKH") String tenKH) {
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.TimKiemTkTrungThanhTheoTen(tenKH);
        return ResponseEntity.ok(tkTrungThanhList);
    }

    @GetMapping("/searchByIdAndName")
    public ResponseEntity<List<TKTrungThanhDTO>> TimKiemTkTrungThanhTheoIDvaTen(@RequestParam("id") Integer id, @RequestParam("tenKH") String tenKH) {
        List<TKTrungThanhDTO> tkTrungThanhList = tkTrungThanhService.TimKiemTkTrungThanhTheoIDvaTen(id, tenKH);
        return ResponseEntity.ok(tkTrungThanhList);
    }
}