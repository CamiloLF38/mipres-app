package com.mipres.mipres.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numeroCedula;

    @Column(nullable = false)
    private String password;

    private String nombre;

    @Enumerated(EnumType.STRING)
    private Rol rol;

    @Builder.Default
    private Boolean activo = true;
}
