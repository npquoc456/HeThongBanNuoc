package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.dto.SanPhamDTO;
import com.example.demo.repository.SanPhamRepository;
import com.example.demo.entity.SanPham;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class SanPhamService {
    @Autowired 
    private SanPhamRepository sanPhamRepository;

    public List<SanPhamDTO> getAllSanPham(){
        return sanPhamRepository.findAll().stream()
                .map(this::mapToDTO).collect(Collectors.toList());
    }

    public Optional<SanPhamDTO> getSanPhamById(Integer id) {
        return sanPhamRepository.findById(id).map(this::mapToDTO);
    }

    private SanPhamDTO mapToDTO(SanPham entity) {
        SanPhamDTO dto = new SanPhamDTO();
        dto.setId(entity.getId());
        dto.setTenSP(entity.getTenSP());
        dto.setGiaSP(entity.getGia());
        dto.setMoTa(entity.getMoTa());
        dto.setLoaiSP(entity.getLoai());
        dto.setHinhAnh(entity.getHinhAnh());
        return dto;
    }

    private SanPham mapToEntity(SanPhamDTO dto) {
        SanPham entity = new SanPham();
        entity.setId(dto.getId());
        entity.setTenSP(dto.getTenSP());
        entity.setGia(dto.getGiaSP());
        entity.setMoTa(dto.getMoTa());
        entity.setLoai(dto.getLoaiSP());
        entity.setHinhAnh(dto.getHinhAnh());
        return entity;
    }

}
