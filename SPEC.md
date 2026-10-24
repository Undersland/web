# Especificação — painel web

## Objetivo

Fornecer uma interface administrativa para autenticar editores, consultar o catálogo, revisar cada nível de uma notícia e publicar conteýo validado.

## Requisitos funcionais

- Solicitar link de autenticação por e-mail e validar o token recebido.
- Armazenar a sessão em cookie HTTP-only, `sameSite=lax` e `secure` em produção.
- Redirecionar usuários sem sessão das páginas que exigem perfil.
- Listar notícias, abrir `/app/news/:slug` e alternar entre Beginner, Intermediate e Advanced.
- Criar notícias por `/api/news`, sem expor o JWT ao JavaScript do navegador.
- O formulário deve respeitar o contrato do `ms-core`: três HTMLs, três listas de palavras, resumo de até 180 caracteres, slug seguro, fonte e autor.
- O prompt de criação deve colocar o artigo original em `links[0]` e o favicon absoluto da publicação em `links[1]`.
- O prompt deve limitar o título a 60 caracteres e o resumo a uma frase de até 80 caracteres para boa leitura nos cards do app.
- O prompt deve gerar artigos progressivamente maiores por nível, iniciar cada HTML pelo corpo em um parágrafo (sem repetir o título) e apresentar o JSON em um bloco de código Markdown; o formulário remove esse wrapper antes do parsing.

## Arquitetura

Use Server Components por padrão. Client Components ficam restritos a interações. Route Handlers em `app/api` formam o BFF; acesso server-side fica em `model`/arquivos `data.ts`; componentes-base ficam em `components/ui`.

## Critérios de qualidade

- Nunca disponibilizar o JWT em props, HTML, logs ou `localStorage`.
- Tratar respostas não JSON e indisponibilidade da API.
- Manter tema claro/escuro, navegação por teclado e HTML semântico.
- Não considerar links de `/books`, `/topic` ou `/news` fora de `/app` como rotas concluídas sem implementá-las.

