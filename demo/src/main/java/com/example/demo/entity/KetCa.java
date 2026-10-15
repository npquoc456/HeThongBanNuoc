package com.example.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "ketca", uniqueConstraints = {
        @UniqueConstraint(name = "uk_ketca_staff_started", columnNames = {"staff_id", "shift_started_at"})
})
public class KetCa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_id", nullable = false)
    private Integer staffId;

    @Column(name = "staff_name", nullable = false)
    private String staffName;

    @Column(name = "shift_started_at", nullable = false)
    private LocalDateTime shiftStartedAt;

    @Column(name = "closed_at", nullable = false)
    private LocalDateTime closedAt;

    @Column(name = "counted_cash", nullable = false)
    private Long countedCash;

    @Column(name = "expected_cash", nullable = false, columnDefinition = "BIGINT NOT NULL DEFAULT 0")
    private Long expectedCash;

    @Column(name = "cash_difference", nullable = false, columnDefinition = "BIGINT NOT NULL DEFAULT 0")
    private Long cashDifference;

    @Column(name = "float_fund", nullable = false)
    private Long floatFund;

    @Column(name = "cash_handover", nullable = false)
    private Long cashHandover;

    @Column(name = "bank_transfer", nullable = false)
    private Long bankTransfer;

    @Column(name = "total_submit", nullable = false)
    private Long totalSubmit;

    @Column(name = "denominations_json", nullable = false, columnDefinition = "TEXT")
    private String denominationsJson;
}
