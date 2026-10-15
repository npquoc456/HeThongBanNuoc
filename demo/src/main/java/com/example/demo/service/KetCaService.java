package com.example.demo.service;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import com.example.demo.dto.KetCaDTO;
import com.example.demo.dto.KetCaDenominationDTO;
import com.example.demo.dto.KetCaRequestDTO;
import com.example.demo.entity.KetCa;
import com.example.demo.entity.HoaDon;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.HoaDonRepository;
import com.example.demo.repository.KetCaRepository;
import com.example.demo.repository.NhanVienRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class KetCaService {
    public static final long INITIAL_FLOAT_FUND = 1_500_000L;
    private static final Set<Integer> ALLOWED_DENOMINATIONS =
            Set.of(500_000, 200_000, 100_000, 50_000, 20_000, 10_000, 5_000, 2_000, 1_000, 500);
    private static final List<TrangThaiHoaDon> PAID_INVOICE_STATUSES =
            List.of(TrangThaiHoaDon.DA_THANH_TOAN, TrangThaiHoaDon.DA_XAC_NHAN);

    private final KetCaRepository ketCaRepository;
    private final NhanVienRepository nhanVienRepository;
    private final HoaDonRepository hoaDonRepository;
    private final ObjectMapper objectMapper;

    public KetCaService(
            KetCaRepository ketCaRepository,
            NhanVienRepository nhanVienRepository,
            HoaDonRepository hoaDonRepository,
            ObjectMapper objectMapper) {
        this.ketCaRepository = ketCaRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.hoaDonRepository = hoaDonRepository;
        this.objectMapper = objectMapper;
    }

    public KetCaDTO getCurrentShift(Integer staffId, LocalDateTime startedAt) {
        validateShift(staffId, startedAt);
        LocalDateTime now = LocalDateTime.now();
        if (startedAt.isAfter(now)) {
            throw new IllegalArgumentException("Thời điểm bắt đầu ca không được ở tương lai.");
        }
        long cashSales = revenue(staffId, startedAt, now, PhuongThucThanhToan.TIEN_MAT);
        long bankSales = revenue(staffId, startedAt, now, PhuongThucThanhToan.CHUYEN_KHOAN);

        KetCaDTO dto = new KetCaDTO();
        dto.setStaffId(staffId);
        dto.setShiftStartedAt(startedAt);
        dto.setExpectedCash(INITIAL_FLOAT_FUND + cashSales);
        dto.setFloatFund(INITIAL_FLOAT_FUND);
        dto.setCashHandover(cashSales);
        dto.setBankTransfer(bankSales);
        dto.setTotalSubmit(cashSales + bankSales);
        return dto;
    }

    public List<KetCaDTO> getHistory() {
        return ketCaRepository.findAllByOrderByClosedAtDesc().stream().map(this::toDTO).toList();
    }

    @Transactional
    public KetCaDTO closeShift(KetCaRequestDTO request) {
        if (request == null) {
            throw new IllegalArgumentException("Thiếu thông tin kết ca.");
        }
        validateShift(request.getStaffId(), request.getShiftStartedAt());
        LocalDateTime now = LocalDateTime.now();
        if (request.getShiftStartedAt().isAfter(now)) {
            throw new IllegalArgumentException("Thời điểm bắt đầu ca không được ở tương lai.");
        }
        if (ketCaRepository.existsByStaffIdAndShiftStartedAt(request.getStaffId(), request.getShiftStartedAt())) {
            throw new IllegalArgumentException("Ca làm này đã được kết ca.");
        }

        List<KetCaDenominationDTO> denominations = validateAndCopyDenominations(request.getDenominations());
        long countedCash = calculateCash(denominations);
        long cashSales = revenue(
                request.getStaffId(), request.getShiftStartedAt(), now, PhuongThucThanhToan.TIEN_MAT);
        long expectedCash = INITIAL_FLOAT_FUND + cashSales;
        long cashDifference = countedCash - expectedCash;
        long cashHandover = Math.max(0, countedCash - INITIAL_FLOAT_FUND);
        long bankTransfer = revenue(
                request.getStaffId(), request.getShiftStartedAt(), now, PhuongThucThanhToan.CHUYEN_KHOAN);

        NhanVien staff = nhanVienRepository.findById(request.getStaffId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhân viên kết ca."));
        KetCa record = new KetCa();
        record.setStaffId(staff.getId());
        record.setStaffName(staff.getHoTen());
        record.setShiftStartedAt(request.getShiftStartedAt());
        record.setClosedAt(now);
        record.setCountedCash(countedCash);
        record.setExpectedCash(expectedCash);
        record.setCashDifference(cashDifference);
        record.setFloatFund(INITIAL_FLOAT_FUND);
        record.setCashHandover(cashHandover);
        record.setBankTransfer(bankTransfer);
        record.setTotalSubmit(cashHandover + bankTransfer);
        record.setDenominationsJson(writeDenominations(denominations));
        return toDTO(ketCaRepository.save(record));
    }

    private void validateShift(Integer staffId, LocalDateTime startedAt) {
        if (staffId == null || startedAt == null) {
            throw new IllegalArgumentException("Thiếu mã nhân viên hoặc thời điểm bắt đầu ca.");
        }
    }

    private List<KetCaDenominationDTO> validateAndCopyDenominations(List<KetCaDenominationDTO> denominations) {
        if (denominations == null || denominations.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập số lượng tiền theo từng mệnh giá.");
        }
        Set<Integer> seenValues = new HashSet<>();
        return denominations.stream().map(item -> {
            if (item == null || item.getValue() == null || !ALLOWED_DENOMINATIONS.contains(item.getValue())) {
                throw new IllegalArgumentException("Có mệnh giá tiền không hợp lệ.");
            }
            if (item.getQty() == null || item.getQty() < 0) {
                throw new IllegalArgumentException("Số lượng từng mệnh giá không được âm.");
            }
            if (!seenValues.add(item.getValue())) {
                throw new IllegalArgumentException("Không được gửi trùng mệnh giá tiền.");
            }
            return new KetCaDenominationDTO(item.getValue(), item.getQty());
        }).toList();
    }

    private long calculateCash(List<KetCaDenominationDTO> denominations) {
        try {
            long total = 0;
            for (KetCaDenominationDTO item : denominations) {
                total = Math.addExact(total, Math.multiplyExact((long) item.getValue(), item.getQty()));
            }
            return total;
        } catch (ArithmeticException ex) {
            throw new IllegalArgumentException("Tổng tiền kiểm đếm vượt quá giới hạn cho phép.", ex);
        }
    }

    private long revenue(
            Integer staffId,
            LocalDateTime startedAt,
            LocalDateTime endedAt,
            PhuongThucThanhToan paymentMethod) {
        List<HoaDon> invoices =
                hoaDonRepository.findByNhanVien_IdAndTrangThaiInAndPhuongThucThanhToanAndNgayTaoGreaterThanEqualAndNgayTaoLessThanEqual(
                        staffId, PAID_INVOICE_STATUSES, paymentMethod, startedAt, endedAt);
        BigDecimal amount = invoices.stream()
                .map(HoaDon::getTongTien)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return amount
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();
    }

    private String writeDenominations(List<KetCaDenominationDTO> denominations) {
        try {
            return objectMapper.writeValueAsString(denominations);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Không thể lưu chi tiết mệnh giá tiền.", ex);
        }
    }

    private KetCaDTO toDTO(KetCa record) {
        KetCaDTO dto = new KetCaDTO();
        dto.setId(record.getId());
        dto.setStaffId(record.getStaffId());
        dto.setStaffName(record.getStaffName());
        dto.setShiftStartedAt(record.getShiftStartedAt());
        dto.setClosedAt(record.getClosedAt());
        dto.setCountedCash(record.getCountedCash());
        dto.setExpectedCash(record.getExpectedCash());
        dto.setCashDifference(record.getCashDifference());
        dto.setFloatFund(record.getFloatFund());
        dto.setCashHandover(record.getCashHandover());
        dto.setBankTransfer(record.getBankTransfer());
        dto.setTotalSubmit(record.getTotalSubmit());
        long difference = record.getCashDifference() == null ? 0 : record.getCashDifference();
        if (difference == 0) {
            dto.setStatus("Đã bàn giao · Khớp");
        } else if (difference > 0) {
            dto.setStatus("Đã bàn giao · Dư " + difference + "đ");
        } else {
            dto.setStatus("Đã bàn giao · Thiếu " + Math.abs(difference) + "đ");
        }
        try {
            dto.setDenominations(objectMapper.readValue(
                    record.getDenominationsJson(), new TypeReference<List<KetCaDenominationDTO>>() {}));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Không thể đọc chi tiết mệnh giá của biên bản kết ca.", ex);
        }
        return dto;
    }
}
