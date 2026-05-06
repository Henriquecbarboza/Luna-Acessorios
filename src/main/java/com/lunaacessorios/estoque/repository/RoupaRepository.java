package com.lunaacessorios.estoque.repository;

import com.lunaacessorios.estoque.entity.Roupa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoupaRepository extends JpaRepository<Roupa, Long> {
    List<Roupa> findByProdutoContainingIgnoreCase(String produto);
    Optional<Roupa> findByCodigo(String codigo);
    List<Roupa> findByCodigoContainingIgnoreCase(String codigo);
    boolean existsByCodigoAndIdNot(String codigo, Long id);
}
