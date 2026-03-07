package com.mipres.mipres.repository;

import com.mipres.mipres.entity.Paciente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByCedula(String documento);

    List<Paciente> findByCuidador_NumeroCedula(String cedulaCuidador);
}
