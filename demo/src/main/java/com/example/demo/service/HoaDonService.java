package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;
import java.math.BigDecimal;

import com.example.demo.dto.HoaDonDTO;
import com.example.demo.dto.CTHDDTO;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTHDid;
import com.example.demo.entity.TKTrungThanh;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.NhanVienRepository;
import com.example.demo.repository.TKTrungThanhRepository;
import com.example.demo.repository.CTHDReponsitory; 
import com.example.demo.repository.SanPhamRepository;

@Service
public class HoaDonService {
    
    @Autowired
    private HoaDonRepository hoaDonRepository;
    
    @Autowired
    private NhanVienRepository nhanVienRepository;
    
    @Autowired
    private TKTrungThanhRepository tkTrungThanhRepository;
    
    @Autowired
    private CTHDReponsitory cthdReponsitory;
    
    @Autowired
    private SanPhamRepository sanPhamRepository;

    public List<HoaDonDTO> getAllHoaDon() {
        return hoaDonRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    public HoaDonDTO getHoaDonById(Integer id) {
        HoaDon hoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có id: " + id));
        return mapToDTO(hoaDon);
    }

    @Transactional
    public HoaDonDTO createHoaDon(HoaDonDTO dto) {
        HoaDon hoaDon = mapToEntity(dto);
        validateCashPayment(hoaDon);
        HoaDon savedHoaDon = hoaDonRepository.save(hoaDon);

        // ĐỔI THÀNH getCTHDs()
        if (dto.getCTHDs() != null && !dto.getCTHDs().isEmpty()) {
            for (CTHDDTO cthdDTO : dto.getCTHDs()) {
                CTHD cthd = new CTHD();
                cthd.setId(new CTHDid(savedHoaDon.getId(), cthdDTO.getSanPhamId()));
                cthd.setHoaDon(savedHoaDon);
                cthd.setSanPham(sanPhamRepository.findById(cthdDTO.getSanPhamId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!")));
                cthd.setSoLuong(cthdDTO.getSoLuong());
                cthd.setDonGia(cthdDTO.getDonGia());
                
                cthdReponsitory.save(cthd); 
            }
        }

        if (savedHoaDon.getTkTrungThanh() != null && dto.getCTHDs() != null) {
            int purchasedQuantity = dto.getCTHDs().stream()
                    .mapToInt(CTHDDTO::getSoLuong)
                    .sum();
            TKTrungThanh customer = savedHoaDon.getTkTrungThanh();
            int updatedPoints = (customer.getSoLuongMua() == null ? 0 : customer.getSoLuongMua())
                    + purchasedQuantity;
            if (updatedPoints >= 10) {
                updatedPoints -= 10;
            }
            customer.setSoLuongMua(updatedPoints);
            tkTrungThanhRepository.save(customer);
        }
        
        return mapToDTO(hoaDonRepository.findById(savedHoaDon.getId()).orElse(savedHoaDon));
    }

    @Transactional
    public HoaDonDTO updateHoaDon(Integer id, HoaDonDTO dto) {
        HoaDon existingHoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có id: " + id));

        HoaDon paymentToValidate = new HoaDon();
        paymentToValidate.setTongTien(dto.getTongTien() != null ? dto.getTongTien() : existingHoaDon.getTongTien());
        paymentToValidate.setTrangThai(dto.getTrangThai());
        paymentToValidate.setPhuongThucThanhToan(
                dto.getPhuongThucThanhToan() != null
                        ? dto.getPhuongThucThanhToan()
                        : existingHoaDon.getPhuongThucThanhToan());
        paymentToValidate.setTienKhachDua(dto.getTienKhachDua());
        paymentToValidate.setTienThoi(dto.getTienThoi());
        validateCashPayment(paymentToValidate);

        if (dto.getNgayTao() != null) existingHoaDon.setNgayTao(dto.getNgayTao());
        if (dto.getTongTien() != null) existingHoaDon.setTongTien(dto.getTongTien());
        if (dto.getTrangThai() != null) existingHoaDon.setTrangThai(dto.getTrangThai());
        if (dto.getPhuongThucThanhToan() != null) {
            existingHoaDon.setPhuongThucThanhToan(dto.getPhuongThucThanhToan());
        }
        if (dto.getPhuongThucThanhToan() == null) {
            if (dto.getTienKhachDua() != null) existingHoaDon.setTienKhachDua(dto.getTienKhachDua());
            if (dto.getTienThoi() != null) existingHoaDon.setTienThoi(dto.getTienThoi());
        } else {
            existingHoaDon.setTienKhachDua(dto.getTienKhachDua());
            existingHoaDon.setTienThoi(dto.getTienThoi());
        }

        HoaDon updatedHoaDon = hoaDonRepository.save(existingHoaDon);
        return mapToDTO(updatedHoaDon);
    }

    public void deleteHoaDon(Integer id) {
        HoaDon existingHoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có id: " + id));
        hoaDonRepository.delete(existingHoaDon);
    }

    private HoaDonDTO mapToDTO(HoaDon entity) {
        HoaDonDTO dto = new HoaDonDTO();
        dto.setId(entity.getId());
        dto.setNgayTao(entity.getNgayTao());
        dto.setTongTien(entity.getTongTien());
        dto.setTienKhachDua(entity.getTienKhachDua());
        dto.setTienThoi(entity.getTienThoi());
        dto.setTrangThai(entity.getTrangThai());
        dto.setPhuongThucThanhToan(entity.getPhuongThucThanhToan());
        
        if (entity.getNhanVien() != null) {
            dto.setNhanVienId(entity.getNhanVien().getId());
            dto.setTenNhanVien(entity.getNhanVien().getHoTen()); 
        }
        
        if (entity.getTkTrungThanh() != null) {
            dto.setTkTrungThanhId(entity.getTkTrungThanh().getId());
            dto.setTenKhachHang(entity.getTkTrungThanh().getTenKH());
        }
        
        if (entity.getCthds() != null && !entity.getCthds().isEmpty()) {
            List<CTHDDTO> cthdDTOList = new ArrayList<>();
            for(CTHD cthd : entity.getCthds()) {
                CTHDDTO cthdDTO = new CTHDDTO();
                cthdDTO.setHoaDonId(cthd.getHoaDon().getId());
                cthdDTO.setSanPhamId(cthd.getSanPham().getId());
                cthdDTO.setSoLuong(cthd.getSoLuong());
                
                if (cthd.getSanPham() != null) {
                    cthdDTO.setTenSanPham(cthd.getSanPham().getTenSP()); 
                }
                cthdDTO.setDonGia(cthd.getDonGia());
                cthdDTOList.add(cthdDTO);
            }
            // ĐỔI THÀNH setCTHDs()
            dto.setCTHDs(cthdDTOList);
        }
        return dto;
    }

    private HoaDon mapToEntity(HoaDonDTO dto) {
        HoaDon entity = new HoaDon();
        entity.setId(dto.getId());
        entity.setNgayTao(dto.getNgayTao());
        entity.setTongTien(dto.getTongTien());
        entity.setTienKhachDua(dto.getTienKhachDua());
        entity.setTienThoi(dto.getTienThoi());
        entity.setTrangThai(dto.getTrangThai());
        entity.setPhuongThucThanhToan(dto.getPhuongThucThanhToan());
        
        if (dto.getNhanVienId() != null) {
            entity.setNhanVien(nhanVienRepository.findById(dto.getNhanVienId()).orElse(null));
        }
        if (dto.getTkTrungThanhId() != null) {
            entity.setTkTrungThanh(tkTrungThanhRepository.findById(dto.getTkTrungThanhId())
                    .orElseThrow(() -> new RuntimeException(
                            "Không tìm thấy tài khoản tích điểm có id: " + dto.getTkTrungThanhId())));
        }

        return entity;
    }

    private void validateCashPayment(HoaDon hoaDon) {
        if (hoaDon.getTrangThai() != com.example.demo.constant.TrangThaiHoaDon.DA_XAC_NHAN
                && hoaDon.getTrangThai() != com.example.demo.constant.TrangThaiHoaDon.DA_THANH_TOAN) {
            return;
        }
        if (hoaDon.getPhuongThucThanhToan() != com.example.demo.constant.PhuongThucThanhToan.TIEN_MAT) {
            return;
        }
        BigDecimal due = hoaDon.getTongTien();
        BigDecimal received = hoaDon.getTienKhachDua();
        BigDecimal change = hoaDon.getTienThoi();
        if (due == null || received == null || change == null
                || received.signum() < 0 || change.signum() < 0
                || received.stripTrailingZeros().scale() > 0 || change.stripTrailingZeros().scale() > 0
                || received.compareTo(due) < 0
                || received.subtract(due).compareTo(change) != 0) {
            throw new IllegalArgumentException("Tiền khách đưa không hợp lệ hoặc tiền thối không khớp hóa đơn.");
        }
    }
}