package com.example.demo.service;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.CTCaDTO;
import com.example.demo.dto.NhanVienDTO;
import com.example.demo.entity.CTCa;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.NhanVienRepository;

import jakarta.transaction.Transactional;

@Service
public class NhanVienService {
    @Autowired 
    private NhanVienRepository nhanVienRepository;
    

    public NhanVienDTO DangNhap(Integer id, String matkhau){
        Optional<NhanVien> nhanVien = nhanVienRepository.TimNhanVienTheoIDvaMK(id, matkhau);
        if(nhanVien.isPresent()){
            
            return mapToDTO(nhanVien.get());
        }
        else{
            throw new RuntimeException("Đăng Nhập Thất Bại: Sai ID hoặc Mật khẩu");
        }
    }

    public NhanVienDTO getNhanVienById(Integer id){
        NhanVien nhanVien = nhanVienRepository.findById(id)
            .orElseThrow( () -> new RuntimeException("khong tim thay nhan vien co id: " + id));
        return mapToDTO(nhanVien);
    }

    @Transactional
    public NhanVienDTO createNhanVien(NhanVienDTO dto){
        NhanVien nhanVien = mapToEntity(dto);
        NhanVien savedNhanVien = nhanVienRepository.save(nhanVien);
        return mapToDTO(savedNhanVien);
    }

    @Transactional
    public NhanVienDTO updateNhanVien(Integer id, NhanVienDTO dto){
        NhanVien existingNhanVien = nhanVienRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Khong thay nhan vien co ID: " + id));
        existingNhanVien.setHoTen(dto.getTenNhanVien());
        existingNhanVien.setEmail(dto.getEmail());
        existingNhanVien.setSdt(dto.getSdt());
        existingNhanVien.setNgaySinh(dto.getNgaySinh());
        existingNhanVien.setNgayLamViec(dto.getNgayLamViec());
        existingNhanVien.setTrangThaiLamViec(dto.getTrangThaiLamViec());
        existingNhanVien.setVaiTro(dto.getVaiTro());

        NhanVien updatedNhanVien = nhanVienRepository.save(existingNhanVien);
        return mapToDTO(updatedNhanVien);
    }

    @Transactional
    public void deteleNhanVien(Integer id){
        NhanVien existingNhanVien = nhanVienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("khong tim thay nhan vien co id: " + id));
        nhanVienRepository.delete(existingNhanVien);
    }

    private NhanVienDTO mapToDTO(NhanVien entity){
        NhanVienDTO dto = new NhanVienDTO(); 
        dto.setId(entity.getId());
        dto.setTenNhanVien(entity.getHoTen());
        dto.setEmail(entity.getEmail());
        dto.setSdt(entity.getSdt());
        dto.setNgaySinh(entity.getNgaySinh());
        dto.setNgayLamViec(entity.getNgayLamViec());
        dto.setTrangThaiLamViec(entity.getTrangThaiLamViec());
        dto.setVaiTro(entity.getVaiTro());

        return dto;
    }
    

    private NhanVien mapToEntity(NhanVienDTO dto){
        NhanVien entity = new NhanVien(); 
        entity.setId(dto.getId());
        entity.setHoTen(dto.getTenNhanVien());
        entity.setEmail(dto.getEmail());
        entity.setSdt(dto.getSdt());
        entity.setNgaySinh(dto.getNgaySinh());
        entity.setNgayLamViec(dto.getNgayLamViec());
        entity.setTrangThaiLamViec(dto.getTrangThaiLamViec());
        entity.setVaiTro(dto.getVaiTro());
        return entity;
    }
}