package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class KetCaDTO {
    private Long id;
    private Integer staffId;
    private String staffName;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime shiftStartedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime closedAt;

    private Long countedCash;
    private Long expectedCash;
    private Long cashDifference;
    private Long floatFund;
    private Long cashHandover;
    private Long bankTransfer;
    private Long totalSubmit;
    private String status;
    private List<KetCaDenominationDTO> denominations;
}
