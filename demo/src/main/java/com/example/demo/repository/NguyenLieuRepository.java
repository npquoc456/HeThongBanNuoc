package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.NguyenLieu;

import org.springframework.data.jpa.repository.Query;

public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, Integer>{

    @Query("""
        SELECT n FROM NguyenLieu n 
        WHERE n.id = :id OR LOWER(n.tenNL) LIKE LOWER(CONCAT('%', :tenNL, '%'))
    """)
    List<NguyenLieu> TimNguyenLieuTheoIDvaTen(int id, String tenNL); 
    
    @Query("""
        SELECT n FROM NguyenLieu n
        WHERE LOWER(n.tenNL) LIKE LOWER(CONCAT('%', :tenNL, '%'))
    """)
    List<NguyenLieu> TimNguyenLieuTheoTen(String tenNL); 
}
