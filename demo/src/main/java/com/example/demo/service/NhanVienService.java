package com.example.demo.service;

import com.example.demo.constant.TrangThaiLamViec;
import com.example.demo.constant.VaiTro;
import com.example.demo.dto.CTCaDTO;
import com.example.demo.dto.NhanVienDTO;
import com.example.demo.entity.CTCa;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.NhanVienRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NhanVienService {

    @Autowired
    private NhanVienRepository nhanVienRepository;

    // 1. Đăng nhập
    public NhanVienDTO DangNhap(Integer id, String matKhau) {
        NhanVien nv = nhanVienRepository.TimNhanVienTheoIDvaMK(id, matKhau)
                .orElseThrow(() -> new RuntimeException("Sai ID hoặc mật khẩu!"));
        return mapToDTO(nv);
    }

    // 2. Lấy danh sách toàn bộ nhân viên
    public List<NhanVienDTO> getAllNhanVien() {
        return nhanVienRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // 3. Lấy thông tin nhân viên theo ID
    public NhanVienDTO getNhanVienById(Integer id) {
        NhanVien nv = nhanVienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có ID: " + id));
        return mapToDTO(nv);
    }

    // 4. Thêm nhân viên mới
    @Transactional
    public NhanVienDTO createNhanVien(NhanVienDTO dto) {
        NhanVien nv = new NhanVien();
        nv.setHoTen(dto.getTenNhanVien());
        nv.setEmail(dto.getEmail());
        nv.setSdt(dto.getSdt());
        nv.setNgaySinh(dto.getNgaySinh());
        nv.setNgayLamViec(dto.getNgayLamViec() != null ? dto.getNgayLamViec() : LocalDate.now());
        nv.setTrangThaiLamViec(dto.getTrangThaiLamViec() != null ? dto.getTrangThaiLamViec() : TrangThaiLamViec.DANG_LAM_VIEC);
        nv.setVaiTro(dto.getVaiTro() != null ? dto.getVaiTro() : VaiTro.NHANVIEN);
        // Mật khẩu mặc định khi tạo nhân viên mới trên hệ thống POS
        nv.setMatKhau("123456");

        NhanVien saved = nhanVienRepository.save(nv);
        return mapToDTO(saved);
    }

    // 5. Cập nhật thông tin nhân viên
    @Transactional
    public NhanVienDTO updateNhanVien(Integer id, NhanVienDTO dto) {
        NhanVien existing = nhanVienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có ID: " + id));

        existing.setHoTen(dto.getTenNhanVien());
        existing.setEmail(dto.getEmail());
        existing.setSdt(dto.getSdt());
        if (dto.getNgaySinh() != null) {
            existing.setNgaySinh(dto.getNgaySinh());
        }
        if (dto.getNgayLamViec() != null) {
            existing.setNgayLamViec(dto.getNgayLamViec());
        }
        if (dto.getTrangThaiLamViec() != null) {
            existing.setTrangThaiLamViec(dto.getTrangThaiLamViec());
        }
        if (dto.getVaiTro() != null) {
            existing.setVaiTro(dto.getVaiTro());
        }

        NhanVien updated = nhanVienRepository.save(existing);
        return mapToDTO(updated);
    }

    // 6. Xóa nhân viên
    @Transactional
    public void deleteNhanVien(Integer id) {
        NhanVien existing = nhanVienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên có ID: " + id));
        nhanVienRepository.delete(existing);
    }

    // 7. Tìm kiếm nhân viên theo ID hoặc Tên (sử dụng các hàm trong NhanVienRepository)
    public List<NhanVienDTO> timKiemNhanVien(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllNhanVien();
        }
        String kw = keyword.trim();
        try {
            Integer parsedId = Integer.parseInt(kw);
            return nhanVienRepository.TimNhanVienTheoIDvaTen(parsedId, kw).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (NumberFormatException e) {
            return nhanVienRepository.TimNhanVienTheoTen(kw).stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        }
    }

    // 8. Chuyển đổi Entity -> DTO (Khớp với NhanVienDTO và CTCaDTO)
    private NhanVienDTO mapToDTO(NhanVien entity) {
        NhanVienDTO dto = new NhanVienDTO();
        dto.setId(entity.getId() != null ? entity.getId() : 0);
        dto.setTenNhanVien(entity.getHoTen());
        dto.setEmail(entity.getEmail());
        dto.setSdt(entity.getSdt());
        dto.setNgaySinh(entity.getNgaySinh());
        dto.setNgayLamViec(entity.getNgayLamViec());
        dto.setTrangThaiLamViec(entity.getTrangThaiLamViec());
        dto.setVaiTro(entity.getVaiTro());

        List<CTCaDTO> ctCaDTOList = new ArrayList<>();
        if (entity.getCtCa() != null) {
            for (CTCa ct : entity.getCtCa()) {
                if (ct.getCaLam() != null) {
                    ctCaDTOList.add(new CTCaDTO(
                            ct.getCaLam().getId(),
                            entity.getId(),
                            ct.getCaLam().getTenCa(),
                            ct.getCaLam().getThoiGianBD(),
                            ct.getCaLam().getThoiGianKT()
                    ));
                }
            }
        }
        dto.setCtCaList(ctCaDTOList);
        return dto;
    }
}