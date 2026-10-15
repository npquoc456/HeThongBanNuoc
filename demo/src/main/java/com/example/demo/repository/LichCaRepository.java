package com.example.demo.repository;

import com.example.demo.entity.LichCa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface LichCaRepository extends JpaRepository<LichCa, Integer> {
    List<LichCa> findByNgayLamBetweenOrderByNgayLamAscThoiGianBDAsc(
            LocalDate startDate, LocalDate endDate);
}
