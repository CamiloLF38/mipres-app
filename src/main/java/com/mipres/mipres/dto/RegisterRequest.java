package com.mipres.mipres.dto;

import com.mipres.mipres.entity.Rol;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Builder;
import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre;
    private String numeroCedula;
    private String password;
    private Rol rol;
}
