package com.example.demo.dto;

import com.example.demo.constant.PhuongThucThanhToan;
import com.example.demo.constant.TrangThaiHoaDon;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HoaDonDTO {
    
    private Integer id; // Có thể null khi frontend gửi request tạo mới

    // Thay vì dùng Object Entity NhanVien/TKTrungThanh, ta chỉ dùng ID để truyền tải nhẹ nhàng
    private Integer nhanVienId;
    
    private Integer tkTrungThanhId; // Khách lẻ thì trường này sẽ là null

    private BigDecimal tongTien;

    private TrangThaiHoaDon trangThai;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime ngayTao;

    private PhuongThucThanhToan phuongThucThanhToan;

    // Danh sách chi tiết các món nước trong hóa đơn
    private List<CTHDDTO> CTHDs;
    /**
     * Dùng Inner Class cho Chi tiết hóa đơn (CTHD) để quản lý code tập trung,
     * không cần đẻ thêm file DTO mới bên ngoài.
     */
}