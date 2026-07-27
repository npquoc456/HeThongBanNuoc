package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "ct_ca")
@Data
public class CTCa {
    @Id
    @EmbeddedId
    private CTCaId id;
}
