package com.mipres.mipres.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pacientes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paciente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String cedula;

    // cuidador opcional
    @ManyToOne(optional = true)
    @JoinColumn(name = "cuidador_id")
    private Usuario cuidador;

    // usuario propio opcional
    @OneToOne(optional = true)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
