# 👗 Loja de Roupas — CRUD com Spring Boot + MySQL

Sistema de gerenciamento de estoque de roupas com interface web.

## 🛠️ Tecnologias
- **Back-end:** Java 21 + Spring Boot 3.4 + Spring Data JPA
- **Banco de dados:** MySQL
- **Front-end:** HTML, CSS e JavaScript puro (servido pelo próprio Spring Boot)

## 📁 Estrutura do Projeto
```
src/
├── main/
│   ├── java/.../
│   │   ├── entity/         → Roupa.java (representa a tabela do banco)
│   │   ├── repository/     → RoupaRepository.java (acesso ao banco)
│   │   ├── service/        → RoupaService.java (regras de negócio)
│   │   └── controller/     → RoupaController.java (endpoints da API REST)
│   └── resources/
│       ├── static/
│       │   ├── index.html  → Interface web
│       │   ├── style.css   → Estilos visuais
│       │   └── app.js      → Lógica do front-end
│       └── application.properties  ← NÃO vai ao GitHub (tem suas senhas)
```

## 🚀 Como rodar localmente

### 1. Configure o banco de dados
Copie o arquivo de exemplo e preencha com suas credenciais:
```bash
cp src/main/resources/application.properties.exemplo src/main/resources/application.properties
```
Edite o `application.properties` com seu usuário e senha do MySQL.

### 2. Execute o projeto
```bash
./mvnw spring-boot:run
```

### 3. Acesse no navegador
```
http://localhost:8080
```

## 🔗 Endpoints da API REST
| Método | URL | Descrição |
|--------|-----|-----------|
| GET | `/api/roupas` | Lista todas as roupas |
| GET | `/api/roupas/{id}` | Busca uma roupa por ID |
| POST | `/api/roupas` | Cria uma nova roupa |
| PUT | `/api/roupas/{id}` | Atualiza uma roupa |
| DELETE | `/api/roupas/{id}` | Remove uma roupa |

## 🔐 Segurança das credenciais
O arquivo `application.properties` está listado no `.gitignore` e **nunca será enviado ao GitHub**.
Quem clonar o projeto precisa criar o próprio `application.properties` a partir do `.exemplo`.
