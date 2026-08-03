package com.example.demo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.NguyenLieuDTO;
import com.example.demo.entity.NguyenLieu;
import com.example.demo.repository.NguyenLieuRepository;

@Service
public class NguyenLieuService {
    @Autowired 
    private NguyenLieuRepository nguyenLieuRepository; 

    public List<NguyenLieuDTO> getAllNguyenLieu(){
        return nguyenLieuRepository.findAll()
                    .stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
    }

    private NguyenLieuDTO mapToDTO(NguyenLieu entity){
        NguyenLieuDTO dto = new NguyenLieuDTO(); 
        dto.setId(entity.getId());
        dto.setTenNL(entity.getTenNL());
        dto.setSoLuong(entity.getSoLuong());
        dto.setDonViTinh(entity.getDonVi());
        dto.setTrangThai(entity.getTrangThai());

        return dto;
    }

    private NguyenLieu mapToEntity(NguyenLieuDTO dto){
        NguyenLieu entity = new NguyenLieu(); 
        entity.setId(dto.getId());
        entity.setTenNL(dto.getTenNL());
        entity.setSoLuong(dto.getSoLuong());
        entity.setDonVi(dto.getDonViTinh());
        entity.setTrangThai(dto.getTrangThai());

        return entity;
    }
}
