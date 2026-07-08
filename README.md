# 👗 Luna Acessórios — Sistema de Gerenciamento de Estoque e Vendas

Sistema completo de gerenciamento de estoque para loja de roupas, com interface web, dashboard, controle de vendas e upload de imagens.

---

<img width="1122" height="629" alt="Screenshot_4" src="https://github.com/user-attachments/assets/b4470690-d30a-4ab2-995d-17326ef719fc" />
<img width="1126" height="634" alt="Screenshot_3" src="https://github.com/user-attachments/assets/f35f2a2a-e922-4a97-bbd9-56395fda6cfe" />
<img width="1123" height="628" alt="Screenshot_2" src="https://github.com/user-attachments/assets/b5d64010-69d3-42e8-a654-579e99783beb" />
<img width="1121" height="627" alt="Screenshot_1" src="https://github.com/user-attachments/assets/5c767eb3-0e0f-43db-89b8-723e3666efa0" />


## 🛠️ Tecnologias

- **Back-end:** Java 21 + Spring Boot 3.4 + Spring Data JPA
- **Banco de dados:** MySQL
- **Front-end:** HTML, CSS e JavaScript puro (servido pelo próprio Spring Boot)

---

## ✨ Funcionalidades

- ✅ Cadastro, edição e exclusão de produtos
- ✅ Cadastro em **lote** — adiciona N unidades do mesmo produto de uma vez
- ✅ **Upload de imagem** por produto com preview e lightbox ao clicar
- ✅ **Dashboard** com cards de resumo em tempo real
- ✅ Registro de **vendas** com nome do comprador e data
- ✅ Edição dos dados de venda (comprador e data)
- ✅ Filtro por status: Em Estoque / Vendidos / Todos
- ✅ Busca por nome do produto ou por código
- ✅ Layout **responsivo** para mobile
- ✅ Modal de confirmação estilizado para exclusão

---

## 📊 Dashboard

| Card | Descrição |
|------|-----------|
| 📦 Total de Produtos | Todos os registros cadastrados |
| 🧺 Peças em Estoque | Soma das quantidades disponíveis |
| 💰 Valor Total em Estoque | Preço × Quantidade de cada item |
| ⚠️ Estoque Baixo | Produtos com 5 ou menos unidades |
| 💎 Produto Mais Caro | Nome e preço do item mais valioso |
| 🛍️ Vendidos | Total de itens com status vendido |

---

## 📁 Estrutura do Projeto

```
src/
├── main/
│   ├── java/.../
│   │   ├── config/         → UploadConfig.java (configuração de imagens)
│   │   ├── entity/         → Roupa.java (representa a tabela do banco)
│   │   ├── repository/     → RoupaRepository.java (acesso ao banco)
│   │   ├── service/        → RoupaService.java (regras de negócio)
│   │   └── controller/     → RoupaController.java (endpoints da API REST)
│   └── resources/
│       ├── static/
│       │   ├── index.html  → Interface web
│       │   ├── style.css   → Estilos visuais
│       │   └── app.js      → Lógica do front-end
│       └── application.properties  ← NÃO vai ao GitHub (contém suas credenciais)
uploads/                            ← Imagens dos produtos (gerada automaticamente)
```

---

## 🚀 Como rodar localmente

### 1. Configure o banco de dados

Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp src/main/resources/application.properties.exemplo src/main/resources/application.properties
```

Edite o `application.properties` com seu usuário e senha do MySQL:

```properties
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
```

O banco `luna_acessorios` é criado automaticamente na primeira execução.

### 2. Execute o projeto

```bash
./mvnw spring-boot:run
```

### 3. Acesse no navegador

```
http://localhost:8080
```

A pasta `uploads/` para armazenar as imagens também é criada automaticamente.

---

## 🔗 Endpoints da API REST

| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/roupas` | Lista todos os produtos |
| GET | `/api/roupas/{id}` | Busca produto por ID |
| GET | `/api/roupas/buscar?termo=X&tipo=produto` | Busca por nome ou código |
| POST | `/api/roupas` | Cadastra novo produto |
| POST | `/api/roupas/lote?quantidade=N` | Cadastra N produtos em lote |
| PUT | `/api/roupas/{id}` | Atualiza produto |
| DELETE | `/api/roupas/{id}` | Remove produto |
| POST | `/api/roupas/{id}/imagem` | Faz upload da imagem |
| POST | `/api/roupas/lote/imagem?ids=1,2,3` | Upload de imagem para lote |
| POST | `/api/roupas/{id}/venda` | Registra venda |
| PUT | `/api/roupas/{id}/venda` | Edita dados da venda |

---

## 🔐 Segurança das credenciais

O arquivo `application.properties` está no `.gitignore` e **nunca é enviado ao GitHub**.

Quem clonar o projeto deve criar o próprio `application.properties` a partir do `.exemplo`:

```bash
cp src/main/resources/application.properties.exemplo src/main/resources/application.properties
```
