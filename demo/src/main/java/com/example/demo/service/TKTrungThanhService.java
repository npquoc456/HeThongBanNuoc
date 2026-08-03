package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TKTrungThanhDTO;
import com.example.demo.entity.TKTrungThanh;
import com.example.demo.repository.TKTrungThanhRepository;
import java.util.stream.Collectors;

@Service
public class TKTrungThanhService {
    @Autowired 
    private TKTrungThanhRepository tkTrungThanhRepository; 

    public List<TKTrungThanhDTO> getAllTkTrungThanh(){
        return tkTrungThanhRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private TKTrungThanhDTO mapToDTO(TKTrungThanh entity){
        TKTrungThanhDTO dto = new TKTrungThanhDTO(); 
        dto.setId(entity.getId());
        dto.setTenKH(entity.getTenKH());
        dto.setNgayTao(entity.getNgayTao());
        dto.setSoLuongMua(entity.getSoLuongMua());

        return dto;
    }

    private TKTrungThanh mapToEntity(TKTrungThanhDTO dto){
        TKTrungThanh entity = new TKTrungThanh(); 
        entity.setId(dto.getId());
        entity.setTenKH(dto.getTenKH());
        entity.setNgayTao(dto.getNgayTao());
        entity.setSoLuongMua(dto.getSoLuongMua());

        return entity;
    }
}
