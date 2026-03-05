package com.mipres.mipres.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String numeroCedula;
    private String password;
}
