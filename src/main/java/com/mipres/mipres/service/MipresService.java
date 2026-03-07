package com.mipres.mipres.service;

import com.mipres.mipres.dto.MipresRequest;
import com.mipres.mipres.entity.EstadoMipres;
import com.mipres.mipres.entity.Mipres;
import com.mipres.mipres.entity.Paciente;
import com.mipres.mipres.entity.Usuario;
import com.mipres.mipres.repository.MipresRepository;
import com.mipres.mipres.repository.PacienteRepository;
import com.mipres.mipres.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MipresService {
    private final MipresRepository mipresRepository;
    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;

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

    //Listar pacientes asociados a un cuidador específico usando su cédula
    public List<Paciente> listarPacientesPorCuidador(String cedulaCuidador) {
        // Buscamos en el repositorio de pacientes filtrando por el atributo numeroCedula del objeto cuidador
        return pacienteRepository.findByCuidador_NumeroCedula(cedulaCuidador);
    }

    //Romper la relación entre el cuidador y el paciente (Desasociar)
    public void desasociarPaciente(Long idPaciente) {
        // Buscamos al paciente por su ID interno para la modificación
        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        // Simplemente ponemos el cuidador en null para romper el vínculo
        paciente.setCuidador(null);

        // Guardamos los cambios en la base de datos
        pacienteRepository.save(paciente);
    }

    public Paciente registrarOVincularPaciente(Paciente datosPaciente, String cedulaCuidador) {
        // 1. Buscamos al usuario que es el cuidador
        Usuario cuidador = usuarioRepository.findByNumeroCedula(cedulaCuidador)
                .orElseThrow(() -> new RuntimeException("Error: Cuidador no identificado"));

        // 2. Intentamos buscar si el paciente ya existe por su cédula
        return pacienteRepository.findByCedula(datosPaciente.getCedula())
            .map(pacienteExistente -> {
                // CASO A: El paciente ya existe, solo actualizamos el cuidador
                pacienteExistente.setCuidador(cuidador);
                return pacienteRepository.save(pacienteExistente);
            })
            .orElseGet(() -> {
                // CASO B: El paciente no existe, lo creamos desde cero asociado al cuidador
                datosPaciente.setCuidador(cuidador);
                return pacienteRepository.save(datosPaciente);
            });
    }

    public List<Mipres> listarVencimientosCuidador(String cedulaCuidador) {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(5);

        // Buscamos pacientes asociados a la cédula del cuidador
        List<Paciente> misPacientes = pacienteRepository.findByCuidador_NumeroCedula(cedulaCuidador);

        return misPacientes.stream()
                .flatMap(p -> mipresRepository.findByPacienteCedula(p.getCedula()).stream())
                // CAMBIO: Ahora filtramos por estado DIRECCIONADO
                .filter(m -> m.getEstado() == EstadoMipres.DIRECCIONADO)
                .filter(m -> {
                    LocalDate f = m.getFechaMaxDireccionamiento();
                    // Dentro de los próximos 5 días a partir de hoy
                    return (f.isBefore(limite) || f.isEqual(limite)) && (f.isAfter(hoy) || f.isEqual(hoy));
                })
                .collect(Collectors.toList());
    }
}
