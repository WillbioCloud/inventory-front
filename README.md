# Inventory Management System — Frontend

Interface web moderna para gerenciamento completo de **inventário, pedidos, clientes e métricas analíticas**, desenvolvida em **React 19**, **TypeScript** e **Tailwind CSS v4**, consumindo a API REST do ecossistema de inventário com autenticação JWT.

---

## 🚀 Tecnologias Utilizadas

| Categoria | Ferramenta |
| :--- | :--- |
| **Core** | React 19, TypeScript, Vite |
| **Roteamento** | React Router DOM v7 |
| **Estilização** | Tailwind CSS v4, Lucide React, Tw-Animate |
| **Componentes UI** | Shadcn UI (Radix/Base-UI), CVA, Clsx, Tailwind Merge |
| **Consumo de API** | Axios (com interceptor de Bearer Token) |
| **Gráficos & Métricas** | Recharts |

---

## 📦 Módulos e Funcionalidades

* **Autenticação JWT:** Rota de Login com persistência de token no `localStorage` e guarda de rotas privadas (`PrivateRoute`).
* **Dashboard Executivo:** Visão panorâmica de indicadores-chave de desempenho (KPIs), movimentações recentes e resumos operacionais.
* **Gestão de Inventário:** Listagem tabular de itens, controle de níveis de estoque, pesquisa rápida e modais para cadastro/edição de produtos.
* **Pedidos (Orders):** Acompanhamento do fluxo de pedidos e status das transações comerciais.
* **Clientes (Customers):** Cadastro, histórico e gestão da carteira de compradores.
* **Analytics:** Gráficos interativos de receita, volume de saídas e métricas financeiras alimentados por Recharts.

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto tomando como base o modelo abaixo:

```env
VITE_API_URL=[https://inventory-api-yvvz.onrender.com](https://inventory-api-yvvz.onrender.com)
```

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base do backend de inventário | `http://localhost:8080` ou URL do Render |

---

## ▶️ Como Executar Localmente

### Pré-requisitos
* Node.js (v18+)
* Gerenciador de pacotes `npm` ou `pnpm`

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/WillbioCloud/inventory-front.git](https://github.com/WillbioCloud/inventory-front.git)
   cd inventory-front
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env # ou configure seu VITE_API_URL
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

O frontend estará disponível por padrão em `http://localhost:5173`.

---

## 📁 Estrutura do Projeto

```text
src/
├── assets/          # Recursos visuais estáticos e logos
├── components/      # Componentes reutilizáveis e UI base (Shadcn UI)
├── lib/             # Utilitários globais (cn, helpers)
├── pages/           # Telas do fluxo da aplicação
│   ├── Analytics.tsx
│   ├── Customers.tsx
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── Layout.tsx
│   ├── Login.tsx
│   └── Orders.tsx
├── services/        # Configuração do Axios e interceptores HTTP
├── App.tsx          # Definição e proteção das rotas da aplicação
└── main.tsx         # Ponto de entrada da aplicação React
```

---

## 🔗 Backend Relacionado

Este frontend foi desenvolvido especificamente para consumir a **Inventory API** (desenvolvida em Spring Boot / Java). O código-fonte do backend está disponível no repositório:


* 📦 [WillbioCloud / inventory-api](https://github.com/WillbioCloud/inventory-api)


---

## 👨‍💻 Autor

**Ricardo William de Macedo Oliveira**

Desenvolvedor Fullstack com foco em arquiteturas modernas utilizando **Java, Spring Boot, React e TypeScript**.