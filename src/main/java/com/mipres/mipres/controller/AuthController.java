package com.mipres.mipres.controller;

import com.mipres.mipres.dto.AuthenticationResponse;
import com.mipres.mipres.dto.LoginRequest;
import com.mipres.mipres.dto.RegisterRequest;
import com.mipres.mipres.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        AuthenticationResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody LoginRequest request) {

        AuthenticationResponse response = authService.login(
            request.getNumeroCedula(),
            request.getPassword()
        );

        return ResponseEntity.ok(response);
    }
}
