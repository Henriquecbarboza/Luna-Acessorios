package com.lunaacessorios.estoque.service;

import com.lunaacessorios.estoque.entity.Roupa;
import com.lunaacessorios.estoque.repository.RoupaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class RoupaService {

    private final RoupaRepository repository;

    @Value("${upload.dir:uploads}")
    private String uploadDir;

    public RoupaService(RoupaRepository repository) {
        this.repository = repository;
    }

    private Path getUploadPath() {
        return Paths.get(uploadDir).toAbsolutePath();
    }

    public List<Roupa> listarTodas() {
        return repository.findAll();
    }

    public Optional<Roupa> buscarPorId(Long id) {
        return repository.findById(id);
    }

    public List<Roupa> buscar(String termo, String tipo) {
        if ("codigo".equalsIgnoreCase(tipo)) {
            return repository.findByCodigoContainingIgnoreCase(termo);
        }
        return repository.findByProdutoContainingIgnoreCase(termo);
    }

    public Roupa salvar(Roupa roupa) {
        if (repository.existsByCodigo(roupa.getCodigo())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um produto com o código: " + roupa.getCodigo()
            );
        }
        if (roupa.getVendido() == null) roupa.setVendido(false);
        return repository.save(roupa);
    }

    /**
     * Cadastro em lote: cria N cópias do mesmo produto de uma vez.
     * - Rejeita se o código já existir em qualquer lote anterior.
     * - Todos os registros do lote compartilham a mesma imagem (mesmo nome de arquivo).
     */
    public List<Roupa> salvarLote(Roupa roupa, int quantidade) {
        if (repository.existsByCodigo(roupa.getCodigo())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um produto com o código: " + roupa.getCodigo()
            );
        }
        if (roupa.getVendido() == null) roupa.setVendido(false);
        List<Roupa> salvos = new ArrayList<>();
        for (int i = 0; i < quantidade; i++) {
            Roupa copia = new Roupa();
            copia.setCodigo(roupa.getCodigo());
            copia.setProduto(roupa.getProduto());
            copia.setTamanho(roupa.getTamanho());
            copia.setPreco(roupa.getPreco());
            copia.setQuantidade(roupa.getQuantidade());
            copia.setCor(roupa.getCor());
            copia.setDescricao(roupa.getDescricao());
            copia.setVendido(false);
            salvos.add(repository.save(copia));
        }
        return salvos;
    }

    public Optional<Roupa> atualizar(Long id, Roupa dadosNovos) {
        return repository.findById(id).map(roupa -> {
            roupa.setCodigo(dadosNovos.getCodigo());
            roupa.setProduto(dadosNovos.getProduto());
            roupa.setTamanho(dadosNovos.getTamanho());
            roupa.setPreco(dadosNovos.getPreco());
            roupa.setQuantidade(dadosNovos.getQuantidade());
            roupa.setCor(dadosNovos.getCor());
            roupa.setDescricao(dadosNovos.getDescricao());
            return repository.save(roupa);
        });
    }

    public Optional<Roupa> registrarVenda(Long id, String comprador, LocalDate dataVenda) {
        return repository.findById(id).map(roupa -> {
            if (Boolean.TRUE.equals(roupa.getVendido())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Produto já foi vendido.");
            }
            roupa.setVendido(true);
            roupa.setComprador(comprador);
            roupa.setDataVenda(dataVenda != null ? dataVenda : LocalDate.now());
            return repository.save(roupa);
        });
    }

    public Optional<Roupa> editarVenda(Long id, String comprador, LocalDate dataVenda) {
        return repository.findById(id).map(roupa -> {
            if (!Boolean.TRUE.equals(roupa.getVendido())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Produto não foi vendido.");
            }
            roupa.setComprador(comprador);
            if (dataVenda != null) roupa.setDataVenda(dataVenda);
            return repository.save(roupa);
        });
    }

    public Optional<Roupa> salvarImagem(Long id, MultipartFile file) {
        return repository.findById(id).map(roupa -> {
            try {
                Path dir = getUploadPath();
                String nomeOriginal = file.getOriginalFilename();
                String extensao = "";
                if (nomeOriginal != null && nomeOriginal.contains(".")) {
                    extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf(".")).toLowerCase();
                }
                String nomeArquivo = "produto_" + id + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
                Path destino = dir.resolve(nomeArquivo);
                if (roupa.getImagem() != null) {
                    try { Files.deleteIfExists(dir.resolve(roupa.getImagem())); } catch (Exception ignored) {}
                }
                Files.copy(file.getInputStream(), destino);
                roupa.setImagem(nomeArquivo);
                return repository.save(roupa);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar imagem: " + e.getMessage());
            }
        });
    }

    /**
     * Salva a imagem uma única vez no disco e aplica o mesmo nome
     * de arquivo em TODOS os registros do lote (mesma lista de ids).
     * Assim todos os itens do lote exibem a mesma foto.
     */
    public void salvarImagemParaLote(List<Long> ids, MultipartFile file) {
        try {
            Path dir = getUploadPath();
            String nomeOriginal = file.getOriginalFilename();
            String extensao = "";
            if (nomeOriginal != null && nomeOriginal.contains(".")) {
                extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf(".")).toLowerCase();
            }
            // Nome único baseado no primeiro id do lote
            String nomeArquivo = "lote_" + ids.get(0) + "_" + UUID.randomUUID().toString().substring(0, 8) + extensao;
            Path destino = dir.resolve(nomeArquivo);
            Files.copy(file.getInputStream(), destino);

            // Atualiza todos os registros do lote com o mesmo nome de arquivo
            for (Long id : ids) {
                repository.findById(id).ifPresent(r -> {
                    r.setImagem(nomeArquivo);
                    repository.save(r);
                });
            }
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar imagem do lote: " + e.getMessage());
        }
    }

    public boolean deletar(Long id) {
        if (repository.existsById(id)) {
            repository.findById(id).ifPresent(r -> {
                if (r.getImagem() != null) {
                    try { Files.deleteIfExists(getUploadPath().resolve(r.getImagem())); } catch (Exception ignored) {}
                }
            });
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}
