package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TKTrungThanhDTO;
import com.example.demo.entity.TKTrungThanh;
import com.example.demo.repository.TKTrungThanhRepository;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.Collector;

@Service
public class TKTrungThanhService {
    @Autowired 
    private TKTrungThanhRepository tkTrungThanhRepository; 

    //lay danh sach tat ca
    public List<TKTrungThanhDTO> getAllTkTrungThanh(){
        return tkTrungThanhRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public TKTrungThanhDTO getTKTrungThanhById (Integer id){
        TKTrungThanh tkTrungThanh = tkTrungThanhRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay tk Khach Hang co id: " + id));
        return mapToDTO(tkTrungThanh);

    }

    public TKTrungThanhDTO createTKTrungThanh (TKTrungThanhDTO dto){
        TKTrungThanh tkTrungThanh = mapToEntity(dto); 
        TKTrungThanh savedTkTrungThanh = tkTrungThanhRepository.save(tkTrungThanh); 
        return mapToDTO(savedTkTrungThanh);
    }

    public TKTrungThanhDTO updatedTkTrungThanhDTO(Integer id, TKTrungThanhDTO dto){
        TKTrungThanh existTkTrungThanh = tkTrungThanhRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay khach hang co id: " + id));
        
        existTkTrungThanh.setId(dto.getId());
        existTkTrungThanh.setTenKH(dto.getTenKH());
        existTkTrungThanh.setNgayTao(dto.getNgayTao());
        existTkTrungThanh.setSoLuongMua(dto.getSoLuongMua());

        TKTrungThanh updatedTkTrungThanh = tkTrungThanhRepository.save(existTkTrungThanh);
        return mapToDTO(updatedTkTrungThanh);
    }

    public void deleteTkTrungThanh(Integer id){
        TKTrungThanh existTkTrungThanh = tkTrungThanhRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("khong tim thay khach hang co id: " + id));
        tkTrungThanhRepository.delete(existTkTrungThanh);
    }

    public List<TKTrungThanhDTO> TimKiemTkTrungThanhTheoTen(String tenKH) {
        return tkTrungThanhRepository.TimKiemKhachHangTheoTen(tenKH).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<TKTrungThanhDTO> TimKiemTkTrungThanhTheoIDvaTen(Integer id, String tenKH) {
        return tkTrungThanhRepository.TimKiemKhachHangTheoIDvaTen(id, tenKH).stream()
            .map(this::mapToDTO).collect(Collectors.toList());
    }
    //chuyen doi
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
