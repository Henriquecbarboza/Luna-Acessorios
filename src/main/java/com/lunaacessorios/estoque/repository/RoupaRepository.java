package com.lunaacessorios.estoque.repository;

import com.lunaacessorios.estoque.entity.Roupa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoupaRepository extends JpaRepository<Roupa, Long> {
    List<Roupa> findByProdutoContainingIgnoreCase(String produto);
    List<Roupa> findByCodigoContainingIgnoreCase(String codigo);
    boolean existsByCodigo(String codigo);
}
