package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.dto.SanPhamDTO;
import com.example.demo.dto.SanPhamNguyenLieuDTO;
import com.example.demo.entity.CTNL;
import com.example.demo.entity.CTNLId;
import com.example.demo.entity.NguyenLieu;
import com.example.demo.repository.SanPhamRepository;
import com.example.demo.repository.CTNLRepository;
import com.example.demo.repository.NguyenLieuRepository;

import jakarta.transaction.Transactional;

import com.example.demo.entity.SanPham;
import java.util.stream.Collectors;
import java.util.HashSet;
import java.util.Set;


@Service
public class SanPhamService {
    @Autowired 
    private SanPhamRepository sanPhamRepository;
    @Autowired
    private NguyenLieuRepository nguyenLieuRepository;
    @Autowired
    private CTNLRepository ctnlRepository;

    //tinh nang lay danh sach san pham
    public List<SanPhamDTO> getAllSanPham(){
        return sanPhamRepository.findAll().stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public SanPhamDTO getSanPhamById(Integer id){
        SanPham sanPham = sanPhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("khong tim thay san pham co id: " + id));
        return mapToDTO(sanPham);
    }

    @Transactional
    public SanPhamDTO createSanPham(SanPhamDTO dto){
        SanPham sanPham = mapToEntity(dto);
        SanPham savedSanPham = sanPhamRepository.save(sanPham);
        saveRecipe(savedSanPham, dto.getNguyenLieus());
        return mapToDTO(savedSanPham);
    }

    @Transactional
    public SanPhamDTO updateSanPhamDTO(Integer id, SanPhamDTO dto){
        SanPham existingSanPham = sanPhamRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay san pham co id: " + id));
        
        existingSanPham.setTenSP(dto.getTenSP());
        existingSanPham.setGia(dto.getGiaSP());
        existingSanPham.setMoTa(dto.getMoTa());
        existingSanPham.setLoai(dto.getLoaiSP());
        existingSanPham.setHinhAnh(dto.getHinhAnh());

        SanPham updatedSanPham = sanPhamRepository.save(existingSanPham);
        if (dto.getNguyenLieus() != null) {
            ctnlRepository.deleteByProductId(id);
            saveRecipe(updatedSanPham, dto.getNguyenLieus());
        }
        return mapToDTO(updatedSanPham);
    }

    @Transactional
    public void deleteSanPham(Integer id){
        SanPham existingSanPham = sanPhamRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay san pham co id: " + id));
        sanPhamRepository.delete(existingSanPham);
    }
    //tinh nang tim kiem san pham 
    public List<SanPhamDTO> TimKiemSanPhamTheoTen(String tenSP) {
        return sanPhamRepository.TimKiemSanPhamTheoTen(tenSP).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<SanPhamDTO> TimKiemSanPhamTheoIDVaTen(Integer id, String tenSP){
        return sanPhamRepository.TimKiemSanPhamTheoIDVaTen(id, tenSP).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }
    
    public List<SanPhamDTO> TimSanPhamTheoLoaiSP(String loai){
        return sanPhamRepository.TimSanPhamTheoLoaiSP(loai).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<SanPhamDTO> TimSanPhamTheoLoaiSPvaTenSP(String loai, String tenSP){
        return sanPhamRepository.TimSanPhamTheoLoaiSPvaTenSP(loai, tenSP).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }
    //tinh nang chuyen doi entity sang dto va nguoc lai

    private SanPhamDTO mapToDTO(SanPham entity) {
        SanPhamDTO dto = new SanPhamDTO();
        dto.setId(entity.getId());
        dto.setTenSP(entity.getTenSP());
        dto.setGiaSP(entity.getGia());
        dto.setMoTa(entity.getMoTa());
        dto.setLoaiSP(entity.getLoai());
        dto.setHinhAnh(entity.getHinhAnh());
        dto.setNguyenLieus(ctnlRepository.findBySanPham_Id(entity.getId()).stream()
                .map(recipe -> new SanPhamNguyenLieuDTO(
                        recipe.getNguyenLieu().getId(),
                        recipe.getNguyenLieu().getTenNL(),
                        recipe.getNguyenLieu().getDonVi(),
                        recipe.getSoLuong()))
                .sorted((left, right) -> left.getTenNL().compareToIgnoreCase(right.getTenNL()))
                .toList());
        return dto;
    }

    private void saveRecipe(SanPham sanPham, List<SanPhamNguyenLieuDTO> recipe) {
        if (recipe == null || recipe.isEmpty()) {
            throw new IllegalArgumentException("Sản phẩm phải có ít nhất một định mức nguyên liệu.");
        }

        Set<Integer> ingredientIds = new HashSet<>();
        for (SanPhamNguyenLieuDTO item : recipe) {
            if (item == null || item.getNguyenLieuId() == null
                    || item.getSoLuongCan() == null
                    || !Double.isFinite(item.getSoLuongCan())
                    || item.getSoLuongCan() <= 0
                    || !ingredientIds.add(item.getNguyenLieuId())) {
                throw new IllegalArgumentException("Công thức có nguyên liệu trùng hoặc định lượng không hợp lệ.");
            }
            NguyenLieu ingredient = nguyenLieuRepository.findById(item.getNguyenLieuId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy nguyên liệu mã " + item.getNguyenLieuId() + "."));
            CTNL relation = new CTNL();
            relation.setId(new CTNLId(sanPham.getId(), ingredient.getId()));
            relation.setSanPham(sanPham);
            relation.setNguyenLieu(ingredient);
            relation.setSoLuong(item.getSoLuongCan());
            ctnlRepository.save(relation);
        }
    }

    private SanPham mapToEntity(SanPhamDTO dto) {
        SanPham entity = new SanPham();
        entity.setTenSP(dto.getTenSP());
        entity.setGia(dto.getGiaSP());
        entity.setMoTa(dto.getMoTa());
        entity.setLoai(dto.getLoaiSP());
        entity.setHinhAnh(dto.getHinhAnh());
        return entity;
    }

}
