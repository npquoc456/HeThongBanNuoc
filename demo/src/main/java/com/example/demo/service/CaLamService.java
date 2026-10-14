package com.example.demo.service;

import com.example.demo.dto.CTCaDTO;
import com.example.demo.dto.CaLamDTO;
import com.example.demo.entity.CTCa;
import com.example.demo.entity.CTCaId;
import com.example.demo.entity.CaLam;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.CaLamReponsitory;
import com.example.demo.repository.NhanVienRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CaLamService {

    @Autowired
    private CaLamReponsitory caLamRepository;

    @Autowired
    private NhanVienRepository nhanVienRepository;

    // Lấy toàn bộ danh sách Ca Làm kèm danh sách nhân viên trong ca (CTCa)
    public List<CaLamDTO> getAllCaLam() {
        return caLamRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CaLamDTO getCaLamById(Integer id) {
        CaLam caLam = caLamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm với ID: " + id));
        return convertToDTO(caLam);
    }

    @Transactional
    public CaLamDTO createCaLam(CaLamDTO dto) {
        CaLam caLam = new CaLam();
        caLam.setTenCa(dto.getTenCa());
        caLam.setThoiGianBD(dto.getThoiGianBD());
        caLam.setThoiGianKT(dto.getThoiGianKT());
        CaLam saved = caLamRepository.save(caLam);

        if (dto.getCtCaList() != null) {
            for (CTCaDTO ctDto : dto.getCtCaList()) {
                assignNhanVienToCaInternal(saved, ctDto.getNhanVienId());
            }
            saved = caLamRepository.save(saved);
        }
        return convertToDTO(saved);
    }

    @Transactional
    public CaLamDTO updateCaLam(Integer id, CaLamDTO dto) {
        CaLam caLam = caLamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm với ID: " + id));
        caLam.setTenCa(dto.getTenCa());
        caLam.setThoiGianBD(dto.getThoiGianBD());
        caLam.setThoiGianKT(dto.getThoiGianKT());
        CaLam updated = caLamRepository.save(caLam);
        return convertToDTO(updated);
    }

    @Transactional
    public void deleteCaLam(Integer id) {
        if (!caLamRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy ca làm với ID: " + id);
        }
        caLamRepository.deleteById(id);
    }

    // Gán nhân viên vào ca làm (Thêm CTCa)
    @Transactional
    public CTCaDTO phanCongCa(Integer caLamId, Integer nhanVienId) {
        CaLam caLam = caLamRepository.findById(caLamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm ID: " + caLamId));
        assignNhanVienToCaInternal(caLam, nhanVienId);
        caLamRepository.save(caLam);

        return new CTCaDTO(
                caLam.getId(),
                nhanVienId,
                caLam.getTenCa(),
                caLam.getThoiGianBD(),
                caLam.getThoiGianKT()
        );
    }

    // Xóa nhân viên khỏi ca làm (Xóa CTCa)
    @Transactional
    public void xoaPhanCongCa(Integer caLamId, Integer nhanVienId) {
        CaLam caLam = caLamRepository.findById(caLamId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ca làm ID: " + caLamId));
        caLam.getCtCa().removeIf(ct ->
                ct.getNhanVien() != null && ct.getNhanVien().getId().equals(nhanVienId)
        );
        caLamRepository.save(caLam);
    }

    private void assignNhanVienToCaInternal(CaLam caLam, Integer nhanVienId) {
        NhanVien nv = nhanVienRepository.findById(nhanVienId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên ID: " + nhanVienId));

        boolean exists = caLam.getCtCa().stream()
                .anyMatch(ct -> ct.getNhanVien() != null && ct.getNhanVien().getId().equals(nhanVienId));

        if (!exists) {
            CTCa ctCa = new CTCa();
            CTCaId ctCaId = new CTCaId();
            ctCaId.setCaLamId(caLam.getId());
            ctCaId.setNhanVienId(nv.getId());

            ctCa.setId(ctCaId);
            ctCa.setCaLam(caLam);
            ctCa.setNhanVien(nv);
            caLam.getCtCa().add(ctCa);
        }
    }

    private CaLamDTO convertToDTO(CaLam caLam) {
        List<CTCaDTO> ctList = new ArrayList<>();
        if (caLam.getCtCa() != null) {
            for (CTCa ct : caLam.getCtCa()) {
                int nvId = ct.getNhanVien() != null ? ct.getNhanVien().getId() : 0;
                ctList.add(new CTCaDTO(
                        caLam.getId(),
                        nvId,
                        caLam.getTenCa(),
                        caLam.getThoiGianBD(),
                        caLam.getThoiGianKT()
                ));
            }
        }
        return new CaLamDTO(
                caLam.getId(),
                caLam.getTenCa(),
                caLam.getThoiGianBD(),
                caLam.getThoiGianKT(),
                ctList
        );
    }
}