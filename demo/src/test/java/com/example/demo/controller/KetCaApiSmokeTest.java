package com.example.demo.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class KetCaApiSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void currentShiftEndpointReturnsSummaryForConfiguredDatabase() throws Exception {
        LocalDateTime startedAt = LocalDateTime.now()
                .withHour(11)
                .withMinute(44)
                .withSecond(1)
                .withNano(0);

        mockMvc.perform(get("/api/ketca/current-shift")
                        .param("staffId", "1")
                        .param("startedAt", startedAt.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.expectedCash").exists())
                .andExpect(jsonPath("$.bankTransfer").exists());
    }
}
