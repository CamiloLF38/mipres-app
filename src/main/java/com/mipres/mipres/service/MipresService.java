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

        Paciente paciente = pacienteRepository.findByCedula(request.getPacienteCedula())
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

    public Mipres actualizarMipres(Long id, MipresRequest request) {
        Mipres mipres = mipresRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("MIPRES no encontrado"));
        
        mipres.setMedicamento(request.getMedicamento());
        mipres.setMolecula(request.getMolecula());
        mipres.setCantidadAplicacionesAutorizadas(request.getCantidadAplicacionesAutorizadas());
        mipres.setFechaMaxDireccionamiento(request.getFechaMaxDireccionamiento());
        mipres.setEstado(request.getEstado());
        return mipresRepository.save(mipres);
    }

    public List<Mipres> buscarPorCedulaPaciente(String cedula) {
        // Primero verificamos si el paciente existe
        Paciente paciente = pacienteRepository.findByCedula(cedula)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con esa cédula"));
        return mipresRepository.findByPacienteCedula(cedula);
    }

    public Paciente guardarPaciente(Paciente paciente) {
        return pacienteRepository.save(paciente);
    }

    public List<Mipres> listar() {
        return mipresRepository.findAll();
    }

    public String testHelloWorld(){
        return "Hello World";
    }

    public Mipres buscarPorNumeroMipres(String numero) {
        return mipresRepository.findByNumeroMipres(numero)
                .orElseThrow(() -> new RuntimeException("MIPRES no encontrado"));
    }
}
