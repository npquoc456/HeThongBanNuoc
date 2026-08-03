package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.demo.entity.SanPham;
import com.example.demo.repository.SanPhamRepository;

@Service
public class SanPhamService {
    @Autowired private SanPhamRepository sanPhamRepository;

    public List<SanPham> getAllSanPham(){
        return sanPhamRepository.findAll();
    }
    
}
