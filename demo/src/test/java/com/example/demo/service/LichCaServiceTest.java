package com.example.demo.service;

import com.example.demo.constant.TrangThaiLamViec;
import com.example.demo.dto.LichCaDTO;
import com.example.demo.entity.LichCa;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.LichCaRepository;
import com.example.demo.repository.NhanVienRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LichCaServiceTest {
    @Mock private LichCaRepository lichCaRepository;
    @Mock private NhanVienRepository nhanVienRepository;
    @InjectMocks private LichCaService lichCaService;

    @Test
    void createsDateSpecificAssignmentForActiveEmployee() {
        NhanVien employee = new NhanVien();
        employee.setId(3);
        employee.setHoTen("Nguyen Van A");
        employee.setTrangThaiLamViec(TrangThaiLamViec.DANG_LAM_VIEC);
        when(nhanVienRepository.findById(3)).thenReturn(Optional.of(employee));
        when(lichCaRepository.save(any(LichCa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LichCaDTO result = lichCaService.create(new LichCaDTO(
                null, 3, null, LocalDate.of(2026, 10, 19), "Ca 1", "06:30", "12:00"));

        ArgumentCaptor<LichCa> assignment = ArgumentCaptor.forClass(LichCa.class);
        verify(lichCaRepository).save(assignment.capture());
        assertEquals(LocalDate.of(2026, 10, 19), assignment.getValue().getNgayLam());
        assertEquals(employee, assignment.getValue().getNhanVien());
        assertEquals("Nguyen Van A", result.getTenNhanVien());
        assertEquals("06:30", result.getThoiGianBD());
    }

    @Test
    void normalizesSingleDigitHourFromShiftTemplate() {
        NhanVien employee = new NhanVien();
        employee.setId(3);
        employee.setHoTen("Nguyen Van A");
        employee.setTrangThaiLamViec(TrangThaiLamViec.DANG_LAM_VIEC);
        when(nhanVienRepository.findById(3)).thenReturn(Optional.of(employee));
        when(lichCaRepository.save(any(LichCa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LichCaDTO result = lichCaService.create(new LichCaDTO(
                null, 3, null, LocalDate.of(2026, 10, 19), "Ca đêm", "22:00", "7:00"));

        assertEquals("07:00", result.getThoiGianKT());
    }

    @Test
    void rejectsInvalidShiftTimeBeforeSaving() {
        assertThrows(RuntimeException.class, () -> lichCaService.create(new LichCaDTO(
                null, 3, null, LocalDate.of(2026, 10, 19), "Ca 1", "sáng", "12:00")));

        verify(lichCaRepository, never()).save(any(LichCa.class));
    }
}
