package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.ArrayList;

import com.example.demo.dto.HoaDonDTO;
import com.example.demo.dto.CTHDDTO;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTHDid;
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
        
        return mapToDTO(hoaDonRepository.findById(savedHoaDon.getId()).orElse(savedHoaDon));
    }

    @Transactional
    public HoaDonDTO updateHoaDon(Integer id, HoaDonDTO dto) {
        HoaDon existingHoaDon = hoaDonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn có id: " + id));

        existingHoaDon.setNgayTao(dto.getNgayTao());
        existingHoaDon.setTongTien(dto.getTongTien());
        existingHoaDon.setTrangThai(dto.getTrangThai());
        existingHoaDon.setPhuongThucThanhToan(dto.getPhuongThucThanhToan());

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
        entity.setTrangThai(dto.getTrangThai());
        entity.setPhuongThucThanhToan(dto.getPhuongThucThanhToan());
        
        if (dto.getNhanVienId() != null) {
            entity.setNhanVien(nhanVienRepository.findById(dto.getNhanVienId()).orElse(null));
        }
        if (dto.getTkTrungThanhId() != null) {
            entity.setTkTrungThanh(tkTrungThanhRepository.findById(dto.getTkTrungThanhId()).orElse(null));
        }

        return entity;
    }
}