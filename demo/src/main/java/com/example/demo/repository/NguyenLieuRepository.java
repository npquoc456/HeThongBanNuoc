package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import com.example.demo.entity.NguyenLieu;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

public interface NguyenLieuRepository extends JpaRepository<NguyenLieu, Integer>{

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT n FROM NguyenLieu n WHERE n.id IN :ids ORDER BY n.id")
    List<NguyenLieu> findAllByIdInForUpdate(@Param("ids") List<Integer> ids);

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
