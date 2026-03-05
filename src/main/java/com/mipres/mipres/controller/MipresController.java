package com.mipres.mipres.controller;

import com.mipres.mipres.dto.MipresRequest;
import com.mipres.mipres.entity.Mipres;
import com.mipres.mipres.service.MipresService;
import lombok.RequiredArgsConstructor;
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
}
