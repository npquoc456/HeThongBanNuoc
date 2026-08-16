package com.example.demo.service;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
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

    public List <CTHDDTO> getCTHDByHoaDonId(Integer hoaDonId) {
        return cthdReponsitory.findByHoaDonId(hoaDonId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());  
    }

    public CTHDDTO createCTHD(CTHDDTO dto) {
        CTHD cthd = mapToEntity(dto);
        CTHD savedCTHD = cthdReponsitory.save(cthd);
        return mapToDTO(savedCTHD);
    }

    public CTHDDTO updateCTHD(Integer hoaDonId, Integer sanPhamId, CTHDDTO dto) {
        CTHD existingCTHD = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn với hoaDonId: " + hoaDonId + " và sanPhamId: " + sanPhamId));
        
        CTHD updatedCTHD = mapToEntity(dto);
        updatedCTHD.setId(existingCTHD.getId());
        
        CTHD savedCTHD = cthdReponsitory.save(updatedCTHD);
        return mapToDTO(savedCTHD);
    }

    public void deleteCTHD(Integer hoaDonId, Integer sanPhamId) {
        CTHD cthd = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn với hoaDonId: " + hoaDonId + " và sanPhamId: " + sanPhamId));
        cthdReponsitory.delete(cthd);
    }

    //tim kiem theo id 
    public CTHDDTO getCTHDById(Integer hoaDonId, Integer sanPhamId) {
        CTHD cthd = cthdReponsitory.findById(new CTHDid(hoaDonId, sanPhamId))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết hóa đơn với hoaDonId: " + hoaDonId + " và sanPhamId: " + sanPhamId));
        return mapToDTO(cthd);
    }
    //tinh nang chuyen doi entity sang dto va nguoc lai

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
        
        entity.setHoaDon(hoaDonRepository.findById(dto.getHoaDonId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn với id: " + dto.getHoaDonId())));
        entity.setSanPham(sanPhamRepository.findById(dto.getSanPhamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với id: " + dto.getSanPhamId())));
        entity.setSoLuong(dto.getSoLuong());

        entity.setDonGia(dto.getDonGia());
        
        return entity;
    }
}
