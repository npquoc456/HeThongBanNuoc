package com.example.demo.service;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.dto.HoaDonDTO;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTNL;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.NguyenLieu;
import com.example.demo.entity.SanPham;
import com.example.demo.repository.CTNLRepository;
import com.example.demo.repository.CTHDReponsitory;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.NhanVienRepository;
import com.example.demo.repository.NguyenLieuRepository;
import com.example.demo.repository.SanPhamRepository;
import com.example.demo.repository.TKTrungThanhRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class HoaDonServiceTest {

    @Mock private HoaDonRepository hoaDonRepository;
    @Mock private NhanVienRepository nhanVienRepository;
    @Mock private TKTrungThanhRepository tkTrungThanhRepository;
    @Mock private CTHDReponsitory cthdReponsitory;
    @Mock private SanPhamRepository sanPhamRepository;
    @Mock private CTNLRepository ctnlRepository;
    @Mock private NguyenLieuRepository nguyenLieuRepository;

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

    @Test
    void payingInvoiceDeductsItsRecipeFromIngredientStock() {
        HoaDon invoice = invoice(TrangThaiHoaDon.CHO_XAC_NHAN);
        NguyenLieu ingredient = ingredient(1, 2.0);
        when(hoaDonRepository.findById(7)).thenReturn(Optional.of(invoice));
        when(hoaDonRepository.save(invoice)).thenReturn(invoice);
        when(cthdReponsitory.findByHoaDon_Id(7)).thenReturn(List.of(invoiceLine(invoice, 2)));
        when(ctnlRepository.findBySanPham_Id(3)).thenReturn(List.of(recipeLine(3, ingredient, 0.25)));
        when(nguyenLieuRepository.findAllByIdInForUpdate(List.of(1))).thenReturn(List.of(ingredient));

        HoaDonDTO request = new HoaDonDTO();
        request.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
        hoaDonService.updateHoaDon(7, request);

        assertEquals(1.5, ingredient.getSoLuong());
        verify(nguyenLieuRepository).saveAll(List.of(ingredient));
    }

    @Test
    void cancellingPaidInvoiceRestoresStockAndReplayingPaidStateDoesNotDoubleDeduct() {
        HoaDon invoice = invoice(TrangThaiHoaDon.DA_THANH_TOAN);
        NguyenLieu ingredient = ingredient(1, 1.5);
        CTHD line = invoiceLine(invoice, 2);
        when(hoaDonRepository.findById(7)).thenReturn(Optional.of(invoice));
        when(hoaDonRepository.save(invoice)).thenReturn(invoice);
        when(cthdReponsitory.findByHoaDon_Id(7)).thenReturn(List.of(line));
        when(ctnlRepository.findBySanPham_Id(3)).thenReturn(List.of(recipeLine(3, ingredient, 0.25)));
        when(nguyenLieuRepository.findAllByIdInForUpdate(List.of(1))).thenReturn(List.of(ingredient));

        HoaDonDTO cancelRequest = new HoaDonDTO();
        cancelRequest.setTrangThai(TrangThaiHoaDon.DA_HUY);
        hoaDonService.updateHoaDon(7, cancelRequest);
        assertEquals(2.0, ingredient.getSoLuong());

        HoaDonDTO paidRequest = new HoaDonDTO();
        paidRequest.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);
        hoaDonService.updateHoaDon(7, paidRequest);
        assertEquals(1.5, ingredient.getSoLuong());
    }

    @Test
    void payingInvoiceWithInsufficientStockFailsWithoutChangingStock() {
        HoaDon invoice = invoice(TrangThaiHoaDon.CHO_XAC_NHAN);
        NguyenLieu ingredient = ingredient(1, 0.25);
        when(hoaDonRepository.findById(7)).thenReturn(Optional.of(invoice));
        when(cthdReponsitory.findByHoaDon_Id(7)).thenReturn(List.of(invoiceLine(invoice, 2)));
        when(ctnlRepository.findBySanPham_Id(3)).thenReturn(List.of(recipeLine(3, ingredient, 0.25)));
        when(nguyenLieuRepository.findAllByIdInForUpdate(List.of(1))).thenReturn(List.of(ingredient));

        HoaDonDTO request = new HoaDonDTO();
        request.setTrangThai(TrangThaiHoaDon.DA_THANH_TOAN);

        assertThrows(IllegalArgumentException.class, () -> hoaDonService.updateHoaDon(7, request));
        assertEquals(0.25, ingredient.getSoLuong());
        verify(nguyenLieuRepository, never()).saveAll(anyList());
    }

    private HoaDon invoice(TrangThaiHoaDon status) {
        HoaDon invoice = new HoaDon();
        invoice.setId(7);
        invoice.setTrangThai(status);
        invoice.setPhuongThucThanhToan(PhuongThucThanhToan.CHUYEN_KHOAN);
        return invoice;
    }

    private CTHD invoiceLine(HoaDon invoice, int quantity) {
        SanPham product = new SanPham();
        product.setId(3);
        product.setTenSP("Sản phẩm test");
        CTHD line = new CTHD();
        line.setHoaDon(invoice);
        line.setSanPham(product);
        line.setSoLuong(quantity);
        return line;
    }

    private NguyenLieu ingredient(int id, double quantity) {
        NguyenLieu ingredient = new NguyenLieu();
        ingredient.setId(id);
        ingredient.setTenNL("Nguyên liệu test");
        ingredient.setSoLuong(quantity);
        ingredient.setDonVi("kg");
        return ingredient;
    }

    private CTNL recipeLine(int productId, NguyenLieu ingredient, double quantity) {
        SanPham product = new SanPham();
        product.setId(productId);
        CTNL recipe = new CTNL();
        recipe.setSanPham(product);
        recipe.setNguyenLieu(ingredient);
        recipe.setSoLuong(quantity);
        return recipe;
    }
}
