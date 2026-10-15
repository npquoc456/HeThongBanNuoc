package com.example.demo.service;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.dto.KetCaDenominationDTO;
import com.example.demo.dto.KetCaRequestDTO;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.KetCa;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.KetCaRepository;
import com.example.demo.repository.NhanVienRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KetCaServiceTest {

    @Mock
    private KetCaRepository ketCaRepository;

    @Mock
    private NhanVienRepository nhanVienRepository;

    @Mock
    private HoaDonRepository hoaDonRepository;

    private KetCaService ketCaService;

    @BeforeEach
    void setUp() {
        ketCaService = new KetCaService(
                ketCaRepository, nhanVienRepository, hoaDonRepository, new ObjectMapper());
    }

    @Test
    void closeShiftPersistsCountedCashMinusFloatAndBankRevenue() {
        LocalDateTime startedAt = LocalDateTime.now().minusHours(8);
        KetCaRequestDTO request = new KetCaRequestDTO();
        request.setStaffId(7);
        request.setShiftStartedAt(startedAt);
        request.setDenominations(List.of(
                new KetCaDenominationDTO(500_000, 3),
                new KetCaDenominationDTO(200_000, 1)
        ));
        NhanVien staff = new NhanVien();
        staff.setId(7);
        staff.setHoTen("Nhân viên ca tối");
        when(ketCaRepository.existsByStaffIdAndShiftStartedAt(7, startedAt)).thenReturn(false);
        when(nhanVienRepository.findById(7)).thenReturn(Optional.of(staff));
        when(hoaDonRepository.findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)), eq(PhuongThucThanhToan.CHUYEN_KHOAN),
                eq(startedAt), any(LocalDateTime.class))).thenReturn(List.of(invoice("100000")));
        when(hoaDonRepository.findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)), eq(PhuongThucThanhToan.TIEN_MAT),
                eq(startedAt), any(LocalDateTime.class))).thenReturn(List.of(invoice("200000")));
        when(ketCaRepository.save(any(KetCa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = ketCaService.closeShift(request);

        assertEquals(1_700_000L, result.getCountedCash());
        assertEquals(1_700_000L, result.getExpectedCash());
        assertEquals(0L, result.getCashDifference());
        assertEquals(1_500_000L, result.getFloatFund());
        assertEquals(200_000L, result.getCashHandover());
        assertEquals(100_000L, result.getBankTransfer());
        assertEquals(300_000L, result.getTotalSubmit());
        assertEquals(2, result.getDenominations().size());
        verify(hoaDonRepository).findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)), eq(PhuongThucThanhToan.CHUYEN_KHOAN),
                eq(startedAt), any(LocalDateTime.class));
        verify(hoaDonRepository).findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)), eq(PhuongThucThanhToan.TIEN_MAT),
                eq(startedAt), any(LocalDateTime.class));
    }

    @Test
    void closeShiftRejectsNegativeDenominationQuantity() {
        KetCaRequestDTO request = new KetCaRequestDTO();
        request.setStaffId(7);
        request.setShiftStartedAt(LocalDateTime.now().minusHours(1));
        request.setDenominations(List.of(new KetCaDenominationDTO(500_000, -1)));

        assertThrows(IllegalArgumentException.class, () -> ketCaService.closeShift(request));
        verify(ketCaRepository, never()).save(any(KetCa.class));
    }

    @Test
    void closeShiftRecordsCashShortageAgainstPaidCashSales() {
        LocalDateTime startedAt = LocalDateTime.now().minusHours(8);
        KetCaRequestDTO request = new KetCaRequestDTO();
        request.setStaffId(7);
        request.setShiftStartedAt(startedAt);
        request.setDenominations(List.of(new KetCaDenominationDTO(500_000, 3)));
        NhanVien staff = new NhanVien();
        staff.setId(7);
        staff.setHoTen("Nhân viên ca tối");
        when(ketCaRepository.existsByStaffIdAndShiftStartedAt(7, startedAt)).thenReturn(false);
        when(nhanVienRepository.findById(7)).thenReturn(Optional.of(staff));
        when(hoaDonRepository.findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)),
                eq(PhuongThucThanhToan.TIEN_MAT), eq(startedAt), any(LocalDateTime.class)))
                .thenReturn(List.of(invoice("250000")));
        when(hoaDonRepository.findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                eq(7), eq(List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN)),
                eq(PhuongThucThanhToan.CHUYEN_KHOAN), eq(startedAt), any(LocalDateTime.class)))
                .thenReturn(List.of());
        when(ketCaRepository.save(any(KetCa.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = ketCaService.closeShift(request);

        assertEquals(1_750_000L, result.getExpectedCash());
        assertEquals(1_500_000L, result.getCountedCash());
        assertEquals(-250_000L, result.getCashDifference());
        assertEquals(0L, result.getCashHandover());
        assertEquals("Đã bàn giao · Thiếu 250000đ", result.getStatus());
    }

    private HoaDon invoice(String total) {
        HoaDon invoice = new HoaDon();
        invoice.setTongTien(new BigDecimal(total));
        return invoice;
    }
}
