package com.mipres.mipres.dto;

import com.mipres.mipres.entity.EstadoMipres;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MipresRequest {
    private String numeroMipres;
    private String pacienteCedula;
    private String medicamento;
    private String molecula;
    private EstadoMipres Estado;
    private Integer cantidadAplicacionesAutorizadas;
    private LocalDate fechaMaxDireccionamiento;
}
