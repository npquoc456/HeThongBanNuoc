package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.NguyenLieuDTO;
import com.example.demo.entity.NguyenLieu;
import com.example.demo.repository.CTNLRepository;
import com.example.demo.repository.NguyenLieuRepository;


@Service
public class NguyenLieuService {
    @Autowired 
    private NguyenLieuRepository nguyenLieuRepository; 
    @Autowired
    private CTNLRepository ctnlRepository;

    public List<NguyenLieuDTO> getAllNguyenLieu(){
        return nguyenLieuRepository.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
    }
    public NguyenLieuDTO getNguyenLieuById(Integer id){
        NguyenLieu nguyenLieu = nguyenLieuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("khong tim thay nguyen lieu co id: " + id));
        return mapToDTO(nguyenLieu);
    }

    public NguyenLieuDTO createNguyenLieu(NguyenLieuDTO dto){
        NguyenLieu nguyenLieu = mapToEntity(dto);
        NguyenLieu savedNguyenLieu = nguyenLieuRepository.save(nguyenLieu);
        return mapToDTO(savedNguyenLieu);
    }

    public NguyenLieuDTO updateNguyenLieuDTO(Integer id, NguyenLieuDTO dto){
        NguyenLieu existingNguyenLieu = nguyenLieuRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay nguyen lieu co id: " + id));
        
        existingNguyenLieu.setTenNL(dto.getTenNL());
        existingNguyenLieu.setSoLuong(dto.getSoLuong());
        existingNguyenLieu.setSoLuongToiThieu(dto.getSoLuongToiThieu());
        existingNguyenLieu.setDonVi(dto.getDonVi()); // Đã sửa từ getDonViTinh() thành getDonVi()
        existingNguyenLieu.setTrangThai(dto.getTrangThai());

        NguyenLieu updatedNguyenLieu = nguyenLieuRepository.save(existingNguyenLieu);
        return mapToDTO(updatedNguyenLieu);
    }

    @Transactional
    public void deleteNguyenLieu(Integer id){
        NguyenLieu existingNguyenLieu = nguyenLieuRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay nguyen lieu co id: " + id));
        ctnlRepository.deleteByIngredientId(id);
        nguyenLieuRepository.delete(existingNguyenLieu);
    }


    //tim kiem 
    public List<NguyenLieuDTO> TimKiemNguyenLieuTheoTen(String tenNL) {
        return nguyenLieuRepository.TimNguyenLieuTheoTen(tenNL).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<NguyenLieuDTO> TimKiemNguyenLieuTheoIDvaTen(Integer id, String tenNL) {
        return nguyenLieuRepository.TimNguyenLieuTheoIDvaTen(id, tenNL).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    //chuyen doi entity sang dto va nguoc lai
    private NguyenLieuDTO mapToDTO(NguyenLieu entity){
        NguyenLieuDTO dto = new NguyenLieuDTO(); 
        dto.setId(entity.getId());
        dto.setTenNL(entity.getTenNL());
        dto.setSoLuong(entity.getSoLuong());
        dto.setSoLuongToiThieu(entity.getSoLuongToiThieu() == null ? 0 : entity.getSoLuongToiThieu());
        dto.setDonVi(entity.getDonVi()); // Đã sửa từ setDonViTinh() thành setDonVi()
        dto.setTrangThai(entity.getTrangThai());

        return dto;
    }

    private NguyenLieu mapToEntity(NguyenLieuDTO dto){
        NguyenLieu entity = new NguyenLieu(); 
        entity.setTenNL(dto.getTenNL());
        entity.setSoLuong(dto.getSoLuong());
        entity.setSoLuongToiThieu(dto.getSoLuongToiThieu());
        entity.setDonVi(dto.getDonVi()); // Đã sửa từ getDonViTinh() thành getDonVi()
        entity.setTrangThai(dto.getTrangThai());

        return entity;
    }
} 