# Estoque Simples — Sistema de controle de estoque

Sistema de controle de estoque com **produtos**, **movimentações** e **relatórios simples**.

## Funcionalidades

- **Produtos**: cadastro com SKU único, categoria, unidade, custo e estoque mínimo; busca, filtro por categoria e filtro "abaixo do mínimo".
- **Movimentações**: entrada, saída e ajuste de inventário (informa-se o saldo contado). O saldo é atualizado na mesma transação do registro e **nunca fica negativo**.
- **Histórico imutável**: cada movimentação guarda a variação e o saldo resultante.
- **Relatórios**: posição do estoque por categoria (com valor a preço de custo), produtos abaixo do mínimo, movimentações por tipo e produtos com mais saídas em um período, com exportação da posição em CSV.

## Como rodar

Pré-requisito: [Node.js](https://nodejs.org) **22.9 ou superior**.

```bash
npm install
cp .env.example .env     # opcional: ajuste a porta e o caminho do banco
npm run seed             # opcional: popula o banco com dados de exemplo
npm run dev              # servidor com recarga automática
```

Abra **http://localhost:3002**. Para rodar sem recarga automática, use `npm start`.

Outros comandos:

| Comando | O que faz |
| --- | --- |
| `npm test` | Roda os testes de integração da API (`node:test`, banco em memória) |
| `npm run seed` | Cria dados de exemplo (só se o banco estiver vazio) |

No VS Code, a configuração em `.vscode/launch.json` permite iniciar e depurar o servidor com **F5**.

## Estrutura de pastas

```
sistema-estoque/
├── data/                       # banco SQLite (criado ao rodar; fora do Git)
├── public/                     # frontend estático
│   ├── css/
│   ├── js/
│   │   └── views/              # visão geral, produtos, movimentações, relatórios
│   └── index.html
├── src/
│   ├── config/
│   ├── database/               # conexão, schema.sql e seed
│   ├── middlewares/
│   ├── modules/
│   │   ├── produtos/           # routes, controller, service, repository, schemas
│   │   ├── movimentacoes/
│   │   └── relatorios/
│   ├── utils/
│   ├── app.js
│   ├── routes.js               # composição das dependências
│   └── server.js
├── tests/
├── .env.example
└── package.json
```

## Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/produtos?q=&categoria=&abaixo_minimo=true&ativos=true` | Lista produtos |
| GET | `/api/produtos/categorias` | Lista categorias em uso |
| POST | `/api/produtos` | Cria produto (aceita `estoque_inicial`) |
| GET · PATCH | `/api/produtos/:id` | Consulta / atualiza produto |
| GET | `/api/movimentacoes?produto_id=&tipo=&de=&ate=&limite=` | Histórico de movimentações |
| POST | `/api/movimentacoes` | Registra `ENTRADA`, `SAIDA` ou `AJUSTE` |
| GET | `/api/relatorios/posicao` | Posição do estoque e valor por categoria |
| GET | `/api/relatorios/abaixo-minimo` | Produtos que precisam de reposição |
| GET | `/api/relatorios/movimentacoes?de=&ate=` | Resumo do período |

Exemplo:

```bash
curl -X POST http://localhost:3002/api/movimentacoes \
  -H "Content-Type: application/json" \
  -d '{"produto_id":1,"tipo":"SAIDA","quantidade":5,"motivo":"Consumo do escritório"}'
```

## Arquitetura

- **API REST** em Node.js + Express 5, com o banco **SQLite** (`better-sqlite3`) em arquivo local — nenhum serviço externo para instalar.
- **Camadas por módulo**: `routes` (rotas e validação) → `controller` (HTTP) → `service` (regras de negócio) → `repository` (SQL). Cada camada só conhece a de baixo.
- **Injeção de dependências simples**: `src/routes.js` monta repositórios e serviços; o banco e o relógio são passados por parâmetro, o que permite testar com banco em memória.
- **Validação de entrada** com [Zod](https://zod.dev) (mensagens em português) e **tratamento centralizado de erros** (`AppError` + `errorHandler`), sempre no formato `{ "error": { "code", "message", "details" } }`.
- **Frontend** em HTML/CSS/JavaScript puro (ES Modules), servido pelo próprio Express. Os elementos são criados via DOM (sem `innerHTML`), evitando XSS.
- **SQL parametrizado** em todas as consultas (sem concatenação de valores).

## Decisões e limites

- Valores monetários são guardados em **centavos (inteiros)**, evitando erros de ponto flutuante.
- A quantidade em estoque só muda por movimentação; o cadastro do produto não altera saldo.
- Produtos não são excluídos: são **desativados**, preservando o histórico.
- Um único depósito, sem lotes, validade ou multiusuário.

## Próximos passos possíveis

Múltiplos depósitos, lotes e validade, fornecedores e pedidos de compra, código de barras e autenticação.
