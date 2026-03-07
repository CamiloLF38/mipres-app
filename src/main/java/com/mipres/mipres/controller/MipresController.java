package com.mipres.mipres.controller;

import com.mipres.mipres.dto.MipresRequest;
import com.mipres.mipres.entity.Mipres;
import com.mipres.mipres.entity.Paciente;
import com.mipres.mipres.service.MipresService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mipres")
@RequiredArgsConstructor
public class MipresController {
    private final MipresService mipresService;

    @PostMapping
    public Mipres crear(@RequestBody MipresRequest request) {
        return mipresService.crearMipres(request);
    }

    @GetMapping("/listar")
    public List<Mipres> listar() {
        return mipresService.listar();
    }

    @GetMapping("/helloWorld")
    public String getHelloWorld() {
        return mipresService.testHelloWorld();
    }

    // Buscar MIPRES por la cedula de paciente
    @GetMapping("/buscar-por-paciente/{cedula}")
    public ResponseEntity<List<Mipres>> buscarPorPaciente(@PathVariable String cedula) {
        List<Mipres> lista = mipresService.buscarPorCedulaPaciente(cedula);
        return ResponseEntity.ok(lista);
    }

    // Crear un paciente
    @PostMapping("/paciente")
    public ResponseEntity<Paciente> crearPaciente(@RequestBody Paciente paciente) {
        return ResponseEntity.ok(mipresService.guardarPaciente(paciente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mipres> actualizar(@PathVariable Long id, @RequestBody MipresRequest request) {
        return ResponseEntity.ok(mipresService.actualizarMipres(id, request));
    }

    @GetMapping("/buscar-por-numero/{numero}")
    public ResponseEntity<Mipres> buscarPorNumero(@PathVariable String numero) {
        return ResponseEntity.ok(mipresService.buscarPorNumeroMipres(numero));
    }

    // Listar pacientes de un cuidador específico
    @GetMapping("/pacientes-por-cuidador/{cedula}")
    public ResponseEntity<List<Paciente>> listarPorCuidador(@PathVariable String cedula) {
        return ResponseEntity.ok(mipresService.listarPacientesPorCuidador(cedula));
    }

    // Desasociar un paciente (quitarle el cuidador)
    @PutMapping("/desasociar-paciente/{id}")
    public ResponseEntity<Void> desasociar(@PathVariable Long id) {
        mipresService.desasociarPaciente(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registrar-vincular-paciente")
    public ResponseEntity<Paciente> registrarVincular(@RequestBody Paciente paciente, @RequestParam String cedulaCuidador) {
        return ResponseEntity.ok(mipresService.registrarOVincularPaciente(paciente, cedulaCuidador));
    }

    @GetMapping("/vencimientos-cuidador/{cedulaCuidador}")
    public ResponseEntity<List<Mipres>> obtenerVencimientos(@PathVariable String cedulaCuidador) {
        return ResponseEntity.ok(mipresService.listarVencimientosCuidador(cedulaCuidador));
    }
}
