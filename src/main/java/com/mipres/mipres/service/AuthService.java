package com.mipres.mipres.service;

import com.mipres.mipres.dto.AuthenticationResponse;
import com.mipres.mipres.dto.RegisterRequest;
import com.mipres.mipres.entity.Paciente;
import com.mipres.mipres.entity.Usuario;
import com.mipres.mipres.entity.Rol;
import com.mipres.mipres.repository.PacienteRepository;
import com.mipres.mipres.repository.UsuarioRepository;
import com.mipres.mipres.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository; // Inyectamos el repositorio de pacientes
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
                .rol(request.getRol())
                .activo(true)
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        if (request.getRol() == Rol.PACIENTE) {
            vincularOCrearPaciente(usuarioGuardado, request);
        }

        //generar JWT
        var jwtToken = jwtService.generateToken(usuario.getNumeroCedula(), usuario.getRol().name());

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .build();
    }

    private void vincularOCrearPaciente(Usuario usuario, RegisterRequest request) {
        // Buscamos si ya existe un registro de paciente con esa cédula
        pacienteRepository.findByCedula(usuario.getNumeroCedula())
            .ifPresentOrElse(pacienteExistente -> {
                // CASO: El registro ya existe (creado por Admin o Cuidador)
                // Actualizamos el nombre y vinculamos el ID del nuevo usuario
                pacienteExistente.setUsuario(usuario);
                pacienteExistente.setNombre(usuario.getNombre());
                pacienteRepository.save(pacienteExistente);
            }, () -> {
                // CASO: El paciente no existe en el sistema
                // Creamos el registro de paciente vinculado al usuario
                Paciente nuevoPaciente = Paciente.builder()
                    .nombre(usuario.getNombre())
                    .cedula(usuario.getNumeroCedula())
                    .usuario(usuario)
                    .build();
                pacienteRepository.save(nuevoPaciente);
            });
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
