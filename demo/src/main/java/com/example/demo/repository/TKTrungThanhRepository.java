package com.example.demo.repository;

import com.example.demo.entity.TKTrungThanh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TKTrungThanhRepository extends JpaRepository<TKTrungThanh, Integer> {
    
    @Query("""
            SELECT t FROM TKTrungThanh t
            WHERE LOWER(t.tenKH) LIKE LOWER(CONCAT('%', :tenKH, '%'))
            """)
    List<TKTrungThanh> TimKiemKhachHangTheoTen(@Param("tenKH") String tenKH);



    @Query("""
             SELECT t FROM TKTrungThanh t
             WHERE t.id = :id
                OR LOWER(t.tenKH) LIKE LOWER(CONCAT('%', :tenKH, '%'))
            """)
    List<TKTrungThanh> TimKiemKhachHangTheoIDvaTen(@Param("id") Integer id, @Param("tenKH") String tenKH);
}
