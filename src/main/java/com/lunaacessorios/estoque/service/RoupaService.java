package com.lunaacessorios.estoque.service;

import com.lunaacessorios.estoque.entity.Roupa;
import com.lunaacessorios.estoque.repository.RoupaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class RoupaService {

    private final RoupaRepository repository;

    public RoupaService(RoupaRepository repository) {
        this.repository = repository;
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
        if (repository.findByCodigo(roupa.getCodigo()).isPresent()) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe um produto com o código: " + roupa.getCodigo()
            );
        }
        return repository.save(roupa);
    }

    public Optional<Roupa> atualizar(Long id, Roupa dadosNovos) {
        if (repository.existsByCodigoAndIdNot(dadosNovos.getCodigo(), id)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "Já existe outro produto com o código: " + dadosNovos.getCodigo()
            );
        }
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

    public boolean deletar(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}
