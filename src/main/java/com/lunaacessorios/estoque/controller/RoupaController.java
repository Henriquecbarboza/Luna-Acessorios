package com.lunaacessorios.estoque.controller;

import com.lunaacessorios.estoque.entity.Roupa;
import com.lunaacessorios.estoque.service.RoupaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

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
        return ResponseEntity.status(201).body(service.salvar(roupa));
    }

    @PostMapping("/lote")
    public ResponseEntity<List<Roupa>> criarLote(
            @RequestBody Roupa roupa,
            @RequestParam(defaultValue = "1") int quantidade) {
        return ResponseEntity.status(201).body(service.salvarLote(roupa, quantidade));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Roupa> atualizar(@PathVariable Long id, @RequestBody Roupa roupa) {
        return service.atualizar(id, roupa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/venda")
    public ResponseEntity<Roupa> registrarVenda(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String comprador = body.getOrDefault("comprador", "");
        String dataStr   = body.getOrDefault("dataVenda", null);
        java.time.LocalDate dataVenda = dataStr != null && !dataStr.isBlank()
            ? java.time.LocalDate.parse(dataStr)
            : null;
        return service.registrarVenda(id, comprador, dataVenda)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/venda")
    public ResponseEntity<Roupa> editarVenda(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String comprador = body.getOrDefault("comprador", "");
        String dataStr   = body.getOrDefault("dataVenda", null);
        java.time.LocalDate dataVenda = dataStr != null && !dataStr.isBlank()
            ? java.time.LocalDate.parse(dataStr)
            : null;
        return service.editarVenda(id, comprador, dataVenda)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/imagem")
    public ResponseEntity<Roupa> uploadImagem(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        return service.salvarImagem(id, file)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/lote/imagem")
    public ResponseEntity<Void> uploadImagemLote(
            @RequestParam("ids") List<Long> ids,
            @RequestParam("file") MultipartFile file) {
        service.salvarImagemParaLote(ids, file);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        if (service.deletar(id)) return ResponseEntity.noContent().build();
        return ResponseEntity.notFound().build();
    }
}
