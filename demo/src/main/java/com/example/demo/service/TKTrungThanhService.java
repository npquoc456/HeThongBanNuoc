package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.entity.TKTrungThanh;
import com.example.demo.repository.TKTrungThanhRepository;

@Service
public class TKTrungThanhService {
    @Autowired private TKTrungThanhRepository tkTrungThanhRepository; 

    public List<TKTrungThanh> getAllTkTrungThanh(){
        return tkTrungThanhRepository.findAll();
    }
}
