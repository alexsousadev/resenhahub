# ResenhaHub

## Descrição

Este é um projeto de plataforma de resenhas que permite aos usuários criar e compartilhar suas resenhas sobre diversos tópicos. Ele possui a opção de comentários e respostas, onde usuários podem discutir e debater sobre as resenhas, criando uma comunidade ativa e engajada.

## Funcionalidades Principais

- Registro e autenticação de usuários
- Criação, edição e exclusão de resenhas
- Comentários em resenhas
- Respostas a comentários
- Sistema de busca de resenhas

## Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL (com Prisma ORM)
- TailwindCSS

## Configuração do Projeto

1. Clone o repositório:
   ```
   git clone https://github.com/devounary/resenhahub
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

## Estrutura do Banco de Dados

O projeto utiliza três modelos principais:

1. **Usuario**: Armazena informações dos usuários registrados.
2. **Resenha**: Contém as resenhas criadas pelos usuários.
3. **Comentario**: Armazena comentários feitos em resenhas, incluindo respostas a outros comentários.

Para mais detalhes, consulte o arquivo `schema.prisma`.
