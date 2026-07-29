package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.NguyenLieu;

public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, Integer>{

    // List<NguyenLieu> TimNguyenLieuTheoIDvaTen(int id, String tenNL); 
    
    // List<NguyenLieu> TimNguyenLieuTheoTen(String tenNL); 
}
