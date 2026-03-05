package com.mipres.mipres.repository;

import com.mipres.mipres.entity.Mipres;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MipresRepository extends JpaRepository<Mipres, Long> {
    Optional<Mipres> findByNumeroMipres(String numeroMipres);
}
