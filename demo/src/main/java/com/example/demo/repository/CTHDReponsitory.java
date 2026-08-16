package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTHDid;
import java.util.List;

public interface CTHDReponsitory extends JpaRepository<CTHD, CTHDid>{
    // List<CTHD> TimCTHDtheoID(String hoaDonID);
    List<CTHD> findByHoaDonId(Integer hoaDonId);
}
