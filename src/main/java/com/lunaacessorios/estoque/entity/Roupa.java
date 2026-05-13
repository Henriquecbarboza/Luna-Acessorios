package com.lunaacessorios.estoque.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "roupas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Roupa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String codigo;

    @Column(nullable = false)
    private String produto;

    @Column(nullable = false)
    private String tamanho;

    @Column(nullable = false)
    private Double preco;

    @Column
    private Integer quantidade;

    @Column
    private String cor;

    @Column
    private String descricao;

    @Column
    private String imagem;

    @Column(nullable = false)
    private Boolean vendido = false;

    @Column
    private String comprador;

    @Column
    private LocalDate dataVenda;

    @Transient
    @JsonProperty("valorTotal")
    public Double getValorTotal() {
        if (preco == null || quantidade == null) return 0.0;
        return preco * quantidade;
    }
}
