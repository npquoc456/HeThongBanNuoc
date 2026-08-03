package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.NguyenLieu;
import com.example.demo.repository.NguyenLieuRepository;

@Service
public class NguyenLieuService {
    @Autowired private NguyenLieuRepository nguyenLieuRepository; 

    public List<NguyenLieu> getAllNguyenLieu(){
        return nguyenLieuRepository.findAll();
    }
}
