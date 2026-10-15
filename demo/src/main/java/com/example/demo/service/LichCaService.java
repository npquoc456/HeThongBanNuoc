package com.example.demo.service;

import com.example.demo.constant.TrangThaiLamViec;
import com.example.demo.dto.LichCaDTO;
import com.example.demo.entity.LichCa;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.LichCaRepository;
import com.example.demo.repository.NhanVienRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class LichCaService {
    private final LichCaRepository lichCaRepository;
    private final NhanVienRepository nhanVienRepository;

    public LichCaService(LichCaRepository lichCaRepository, NhanVienRepository nhanVienRepository) {
        this.lichCaRepository = lichCaRepository;
        this.nhanVienRepository = nhanVienRepository;
    }

    @Transactional(readOnly = true)
    public List<LichCaDTO> getSchedule(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null || endDate.isBefore(startDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khoảng ngày không hợp lệ");
        }
        return lichCaRepository.findByNgayLamBetweenOrderByNgayLamAscThoiGianBDAsc(startDate, endDate)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public LichCaDTO create(LichCaDTO dto) {
        return toDto(lichCaRepository.save(toEntity(new LichCa(), dto)));
    }

    @Transactional
    public List<LichCaDTO> createAll(List<LichCaDTO> assignments) {
        if (assignments == null || assignments.isEmpty()) {
            return List.of();
        }
        return assignments.stream()
                .map(dto -> toDto(lichCaRepository.save(toEntity(new LichCa(), dto))))
                .toList();
    }

    @Transactional
    public LichCaDTO update(Integer id, LichCaDTO dto) {
        LichCa assignment = lichCaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phân công ca"));
        return toDto(lichCaRepository.save(toEntity(assignment, dto)));
    }

    @Transactional
    public void delete(Integer id) {
        if (!lichCaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy phân công ca");
        }
        lichCaRepository.deleteById(id);
    }

    private LichCa toEntity(LichCa assignment, LichCaDTO dto) {
        if (dto == null || dto.getNhanVienId() == null || dto.getNgayLam() == null
                || dto.getTenCa() == null || dto.getTenCa().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu thông tin phân công ca");
        }

        String startTime = normalizeTime(dto.getThoiGianBD());
        String endTime = normalizeTime(dto.getThoiGianKT());
        NhanVien employee = nhanVienRepository.findById(dto.getNhanVienId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy nhân viên"));
        if (employee.getTrangThaiLamViec() != TrangThaiLamViec.DANG_LAM_VIEC) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ nhân viên đang làm mới được xếp ca");
        }

        assignment.setNhanVien(employee);
        assignment.setNgayLam(dto.getNgayLam());
        assignment.setTenCa(dto.getTenCa().trim());
        assignment.setThoiGianBD(startTime);
        assignment.setThoiGianKT(endTime);
        return assignment;
    }

    private String normalizeTime(String value) {
        if (value == null || !value.matches("\\d{1,2}:\\d{2}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ bắt đầu/kết thúc không hợp lệ");
        }
        String[] parts = value.split(":");
        try {
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            if (hour > 23 || minute > 59) {
                throw new NumberFormatException("Giờ nằm ngoài phạm vi");
            }
            return "%02d:%02d".formatted(hour, minute);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giờ bắt đầu/kết thúc không hợp lệ");
        }
    }

    private LichCaDTO toDto(LichCa assignment) {
        return new LichCaDTO(
                assignment.getId(),
                assignment.getNhanVien().getId(),
                assignment.getNhanVien().getHoTen(),
                assignment.getNgayLam(),
                assignment.getTenCa(),
                assignment.getThoiGianBD(),
                assignment.getThoiGianKT()
        );
    }
}
