package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.demo.dto.SanPhamDTO;
import com.example.demo.repository.SanPhamRepository;
import com.example.demo.entity.SanPham;

import java.util.stream.Collector;
import java.util.stream.Collectors;


@Service
public class SanPhamService {
    @Autowired 
    private SanPhamRepository sanPhamRepository;

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

    public SanPhamDTO createSanPham(SanPhamDTO dto){
        SanPham sanPham = mapToEntity(dto);
        SanPham savedSanPham = sanPhamRepository.save(sanPham);
        return mapToDTO(savedSanPham);
    }

    public SanPhamDTO updateSanPhamDTO(Integer id, SanPhamDTO dto){
        SanPham existingSanPham = sanPhamRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay san pham co id: " + id));
        
        existingSanPham.setTenSP(dto.getTenSP());
        existingSanPham.setGia(dto.getGiaSP());
        existingSanPham.setMoTa(dto.getMoTa());
        existingSanPham.setLoai(dto.getLoaiSP());
        existingSanPham.setHinhAnh(dto.getHinhAnh());

        SanPham updatedSanPham = sanPhamRepository.save(existingSanPham);
        return mapToDTO(updatedSanPham);
    }

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
