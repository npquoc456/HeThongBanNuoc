package com.example.demo.service;

import com.example.demo.dto.NhanVienDTO;
import com.example.demo.entity.NhanVien;
import com.example.demo.repository.NhanVienRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NhanVienServiceTest {

    @Mock
    private NhanVienRepository nhanVienRepository;

    @InjectMocks
    private NhanVienService nhanVienService;

    @Test
    void createNhanVienRejectsMismatchedPasswordConfirmation() {
        NhanVienDTO request = validRequest();
        request.setXacNhanMatKhau("different");

        assertThrows(IllegalArgumentException.class, () -> nhanVienService.createNhanVien(request));
        verify(nhanVienRepository, never()).save(any(NhanVien.class));
    }

    @Test
    void createNhanVienUsesConfirmedPasswordAndNeverReturnsIt() throws Exception {
        NhanVienDTO request = validRequest();
        when(nhanVienRepository.save(any(NhanVien.class))).thenAnswer(invocation -> {
            NhanVien saved = invocation.getArgument(0);
            saved.setId(12);
            return saved;
        });

        NhanVienDTO created = nhanVienService.createNhanVien(request);

        verify(nhanVienRepository).save(org.mockito.ArgumentMatchers.argThat(
                saved -> "secret".equals(saved.getMatKhau())));
        String responseJson = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .writeValueAsString(created);
        assertFalse(responseJson.contains("matKhau"));
        assertFalse(responseJson.contains("secret"));
    }

    private NhanVienDTO validRequest() {
        NhanVienDTO request = new NhanVienDTO();
        request.setTenNhanVien("Nguyen Van A");
        request.setEmail("a@example.com");
        request.setSdt("0900000000");
        request.setNgaySinh(LocalDate.of(2000, 1, 1));
        request.setMatKhau("secret");
        request.setXacNhanMatKhau("secret");
        return request;
    }
}
