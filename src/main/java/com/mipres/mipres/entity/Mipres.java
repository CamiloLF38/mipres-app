package com.mipres.mipres.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "mipres")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mipres {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String numeroMipres;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private String medicamento;
    private String molecula;

    private Integer cantidadAplicacionesAutorizadas;

    private LocalDate fechaMaxDireccionamiento;

    @Enumerated(EnumType.STRING)
    private EstadoMipres estado;

    @Builder.Default
    private Boolean direccionado = false;

    private LocalDate fechaDireccionamiento;
}
