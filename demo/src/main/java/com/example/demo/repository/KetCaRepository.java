package com.example.demo.repository;

import com.example.demo.entity.KetCa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface KetCaRepository extends JpaRepository<KetCa, Long> {
    List<KetCa> findAllByOrderByClosedAtDesc();

    boolean existsByStaffIdAndShiftStartedAt(Integer staffId, LocalDateTime shiftStartedAt);
}
