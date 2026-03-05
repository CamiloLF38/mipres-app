package com.mipres.mipres.service;

import com.mipres.mipres.dto.AuthenticationResponse;
import com.mipres.mipres.dto.RegisterRequest;
import com.mipres.mipres.entity.Usuario;
import com.mipres.mipres.entity.Rol;
import com.mipres.mipres.repository.UsuarioRepository;
import com.mipres.mipres.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationResponse register(RegisterRequest request) {
        //validar duplicado por cédula
        if (usuarioRepository.findByNumeroCedula(request.getNumeroCedula()).isPresent()) {
            throw new RuntimeException("Ya existe un usuario con esa cédula");
        }
        //crear usuario alineado con tu modelo
        var usuario = Usuario.builder()
                .nombre(request.getNombre())
                .numeroCedula(request.getNumeroCedula())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())   //control del backend
                .activo(true)     //control del backend
                .build();

        usuarioRepository.save(usuario);

        //generar JWT
        var jwtToken = jwtService.generateToken(usuario.getNumeroCedula(), usuario.getRol().name());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    public AuthenticationResponse login(String cedula, String password) {

        Usuario user = usuarioRepository.findByNumeroCedula(cedula)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        String token = jwtService.generateToken(user.getNumeroCedula(), user.getRol().name());

        return AuthenticationResponse.builder()
                .token(token)
                .nombre(user.getNombre())
                .numeroCedula(user.getNumeroCedula())
                .rol(user.getRol().name())
                .build();
    }
}
