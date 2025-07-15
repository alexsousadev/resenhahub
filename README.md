# ResenhaHub

## Descrição

O ResenhaHub é uma plataforma web inovadora dedicada à criação, compartilhamento e discussão de resenhas sobre livros, filmes, séries, produtos e muito mais. Nosso objetivo é proporcionar um espaço dinâmico onde usuários possam expressar opiniões, trocar experiências e construir conhecimento coletivo de forma colaborativa.

Seja você um leitor ávido, cinéfilo, entusiasta de tecnologia ou apenas alguém em busca de opiniões confiáveis, o ResenhaHub oferece as ferramentas necessárias para compartilhar suas experiências e encontrar novas perspectivas.

## Funcionalidades Principais

- **Cadastro e autenticação de usuários:** Garanta segurança e personalização ao criar sua conta e acessar a plataforma.
- **Criação, edição e exclusão de resenhas:** Compartilhe suas opiniões sobre livros, filmes, séries, produtos e outros temas, com liberdade para editar ou remover suas publicações.
- **Comentários e respostas:** Interaja com outros usuários comentando em resenhas e respondendo a comentários, promovendo discussões ricas e construtivas.

## Tecnologias Utilizadas

- **Node.js & Express.js:** Backend robusto e escalável para gerenciamento das rotas, autenticação e lógica de negócio.
- **PostgreSQL & Prisma ORM:** Banco de dados relacional de alta performance, com modelagem eficiente e integração facilitada via Prisma.
- **TailwindCSS:** Estilização moderna e responsiva, garantindo uma interface agradável e adaptável.
- **JWT (JSON Web Token):** Autenticação segura e baseada em tokens para proteger as rotas e dados dos usuários.

## Configuração do Projeto

1. Clone o repositório:
   ```
   git clone https://github.com/alexsousadev/resenhahub
   cd resenhahub
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione a URL de conexão do banco de dados PostgreSQL (onde "usuario" e "senha" são as credenciais de conexão com seu Postgres) e a palavra-chave do Token JWT:
     ```
     DATABASE_URL="postgresql://<usuario>:<senha>@localhost:5432/resenhahub"
     JWT_SECRET_KEY="<palavra-chave>"
     ```
4. Execute as inicializações do Prisma:
   ```
   npx prisma db push
   npx prisma generate
   ```

5. Para visualizar o banco, digite:
   ```
   npx prisma studio
   ```

## Executando o Projeto

1. Inicie o projeto:
   ```
   npm run start
   ```

2. Faça a construção CSS do Tailwind:
   ```
   npm run build:css
   ```

3. O servidor estará rodando em `http://localhost:3000`

Para mais detalhes sobre os campos e relacionamentos, consulte o arquivo `schema.prisma`.
