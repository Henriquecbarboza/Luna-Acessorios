package com.lunaacessorios.estoque.controller;

import com.lunaacessorios.estoque.entity.Roupa;
import com.lunaacessorios.estoque.service.RoupaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roupas")
@CrossOrigin(origins = "*")
public class RoupaController {

    private final RoupaService service;

    public RoupaController(RoupaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Roupa> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Roupa> buscarPorId(@PathVariable Long id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public List<Roupa> buscar(
            @RequestParam String termo,
            @RequestParam(defaultValue = "produto") String tipo) {
        return service.buscar(termo, tipo);
    }

    @PostMapping
    public ResponseEntity<Roupa> criar(@RequestBody Roupa roupa) {
        Roupa salva = service.salvar(roupa);
        return ResponseEntity.status(201).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Roupa> atualizar(@PathVariable Long id, @RequestBody Roupa roupa) {
        return service.atualizar(id, roupa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (service.deletar(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
