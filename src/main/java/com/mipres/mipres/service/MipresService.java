package com.mipres.mipres.service;

import com.mipres.mipres.dto.MipresRequest;
import com.mipres.mipres.entity.EstadoMipres;
import com.mipres.mipres.entity.Mipres;
import com.mipres.mipres.entity.Paciente;
import com.mipres.mipres.repository.MipresRepository;
import com.mipres.mipres.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MipresService {
    private final MipresRepository mipresRepository;
    private final PacienteRepository pacienteRepository;

    public Mipres crearMipres(MipresRequest request) {

        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no existe"));

        Mipres mipres = Mipres.builder()
                .numeroMipres(request.getNumeroMipres())
                .paciente(paciente)
                .medicamento(request.getMedicamento())
                .molecula(request.getMolecula())
                .cantidadAplicacionesAutorizadas(request.getCantidadAplicacionesAutorizadas())
                .fechaMaxDireccionamiento(request.getFechaMaxDireccionamiento())
                .estado(EstadoMipres.PENDIENTE)
                .direccionado(false)
                .build();

        return mipresRepository.save(mipres);
    }

    public List<Mipres> listar() {
        return mipresRepository.findAll();
    }

    public String testHelloWorld(){
        return "Hello World";
    }
}
