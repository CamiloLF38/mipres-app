package com.mipres.mipres.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MipresRequest {
    private String numeroMipres;
    private Long pacienteId;
    private String medicamento;
    private String molecula;
    private Integer cantidadAplicacionesAutorizadas;
    private LocalDate fechaMaxDireccionamiento;
}
