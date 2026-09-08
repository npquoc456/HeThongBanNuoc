package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

import com.example.demo.dto.TopProductDTO;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTHDid;

public interface CTHDReponsitory extends JpaRepository<CTHD, CTHDid> {

    List<CTHD> findByHoaDonId(Integer hoaDonId);

    @Query("""
        SELECT new com.example.demo.dto.TopProductDTO(
            sp.id,
            sp.tenSP,
            CAST(SUM(c.soLuong) AS integer)
        )
        FROM CTHD c
        JOIN c.sanPham sp
        JOIN c.hoaDon h
        WHERE h.trangThai = com.example.demo.constant.TrangThaiHoaDon.DA_THANH_TOAN
        GROUP BY sp.id, sp.tenSP
        ORDER BY SUM(c.soLuong) DESC
    """)
    List<TopProductDTO> getTopSellingProducts();
}
