package com.example.demo.dto;

public class LoginRequest {
    
    private Integer id;
    private String matKhau;

    // BẮT BUỘC CÓ: Constructor rỗng để Spring Boot (Jackson) có thể tạo đối tượng
    public LoginRequest() {
    }

    // Getters và Setters để Spring Boot tự động "bơm" dữ liệu JSON vào
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(String matKhau) {
        this.matKhau = matKhau;
    }
}