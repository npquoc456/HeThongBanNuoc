package com.example.demo.service;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.dto.HoaDonDTO;
import com.example.demo.repository.CTHDReponsitory;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.NhanVienRepository;
import com.example.demo.repository.SanPhamRepository;
import com.example.demo.repository.TKTrungThanhRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HoaDonServiceTest {

    @Mock private HoaDonRepository hoaDonRepository;
    @Mock private NhanVienRepository nhanVienRepository;
    @Mock private TKTrungThanhRepository tkTrungThanhRepository;
    @Mock private CTHDReponsitory cthdReponsitory;
    @Mock private SanPhamRepository sanPhamRepository;

    @InjectMocks private HoaDonService hoaDonService;

    @Test
    void createPaidCashInvoiceRejectsInsufficientTender() {
        HoaDonDTO request = new HoaDonDTO();
        request.setTongTien(new BigDecimal("50000"));
        request.setTrangThai(TrangThaiHoaDon.DA_XAC_NHAN);
        request.setPhuongThucThanhToan(PhuongThucThanhToan.TIEN_MAT);
        request.setTienKhachDua(new BigDecimal("40000"));
        request.setTienThoi(BigDecimal.ZERO);

        assertThrows(IllegalArgumentException.class, () -> hoaDonService.createHoaDon(request));
        verify(hoaDonRepository, never()).save(any());
    }
}
