package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.CTHDDTO;
import com.example.demo.entity.CTHD;
import com.example.demo.entity.CTHDid;
import com.example.demo.repository.CTHDReponsitory;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.SanPhamRepository;

@Service
public class CTHDService {
    @Autowired
    private CTHDReponsitory cthdReponsitory;

    @Autowired
    private HoaDonRepository hoaDonRepository;

    @Autowired 
    private SanPhamRepository sanPhamRepository;

    public List<CTHDDTO> getCTHDByHoaDonId(Integer hoaDonId) {
        return cthdReponsitory.findByHoaDonId(hoaDonId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());  
    }

    @Transactional
    public CTHDDTO createCTHD(CTHDDTO dto) {
        CTHD cthd = mapToEntity(dto);
        CTHD savedCTHD = cthdReponsitory.save(cthd);
        return mapToDTO(savedCTHD);
    }

    @Transactional
    public CTHDDTO updateCTHD(Integer hoaDonId, Integer sanPhamId, CTHDDTO dto) {
        // ĐÃ FIX: Lấy đối tượng cũ ra và set lại thuộc tính, KHÔNG tạo entity mới
        CTHD existingCTHD = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn!"));
        
        // Chỉ cập nhật số lượng và đơn giá (Không được phép sửa ID hay Sản Phẩm/Hóa đơn của dòng đó)
        existingCTHD.setSoLuong(dto.getSoLuong());
        existingCTHD.setDonGia(dto.getDonGia());
        
        CTHD savedCTHD = cthdReponsitory.save(existingCTHD);
        return mapToDTO(savedCTHD);
    }

    @Transactional
    public void deleteCTHD(Integer hoaDonId, Integer sanPhamId) {
        CTHD cthd = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn!"));
        cthdReponsitory.delete(cthd);
    }

    public CTHDDTO getCTHDById(Integer hoaDonId, Integer sanPhamId) {
        CTHD cthd = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn!"));
        return mapToDTO(cthd);
    }

    private CTHDDTO mapToDTO(CTHD entity) {
        CTHDDTO dto = new CTHDDTO();
        dto.setHoaDonId(entity.getHoaDon().getId());
        dto.setSanPhamId(entity.getSanPham().getId());
        dto.setSoLuong(entity.getSoLuong());
        dto.setDonGia(entity.getDonGia()); 
        
        if (entity.getSanPham() != null) {
            dto.setTenSanPham(entity.getSanPham().getTenSP());
        }
        return dto;
    }

    private CTHD mapToEntity(CTHDDTO dto) {
        CTHD entity = new CTHD();
        
        // ĐÃ FIX: Bắt buộc phải khởi tạo đối tượng Khóa chính kép (CTHDid) trước
        entity.setId(new CTHDid(dto.getHoaDonId(), dto.getSanPhamId()));
        
        entity.setHoaDon(hoaDonRepository.findById(dto.getHoaDonId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!")));
        entity.setSanPham(sanPhamRepository.findById(dto.getSanPhamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!")));
                
        entity.setSoLuong(dto.getSoLuong());
        entity.setDonGia(dto.getDonGia());
        
        return entity;
    }
}