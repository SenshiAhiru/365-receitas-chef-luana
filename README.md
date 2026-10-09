# Método 3S — Sabor Sem Sacrifícios

Site: https://metodo3s.vercel.app/

Base recuperada da página pública https://as365receitascheflu.lovable.app/ em 09/10/2026. A primeira revisão preserva o original no histórico Git. A identidade atual usa Método 3S, a promessa aprovada pelo proprietário e Marina Duarte como apresentadora virtual, com verde-oliva, creme e terracota. Estrutura das seções e preços originais foram mantidos.

## Executar

Requer Node.js 20 ou superior. Não há dependências para instalar.

```sh
npm run dev
```

Acesse http://127.0.0.1:4187. `npm run build` gera `dist/`, configurado para publicação na Vercel.

## Arquivos recuperados

- `public/index.html`: HTML público original, incluindo todos os textos, seções e metadados.
- `public/assets/styles-C7iWKo_2.css`: estilos originais e regras responsivas.
- `public/assets/index-A0W5kZm9.js`: código publicado da página, incluindo carrosséis, perguntas, avaliações e ofertas.
- `public/assets/index-C0GYz8sY.js`: runtime publicado original.
- `public/assets/`: imagens originais, incluindo 22 arquivos anteriormente hospedados no Imgur/ImgBB.

O código foi recuperado da versão publicada: não é o projeto-fonte interno do Lovable. Os arquivos JavaScript estão compilados. Alterações futuras devem considerar tanto o HTML inicial quanto o código que o atualiza no navegador.

Os textos de marca, abertura, metadados e duas imagens de produto foram adaptados para o Método 3S. As imagens `metodo3s-banner.png` e `metodo3s-receitas.png` foram criadas com ImageGen a partir das referências originais e da personagem aprovada na conversa. O banner identifica Marina como apresentadora virtual na legenda da página.

Preços, links de checkout e integrações UTMify foram preservados. Os scripts de telemetria exclusivos da infraestrutura Lovable foram removidos, pois seus endpoints não existem nesta hospedagem. Google Fonts e UTMify continuam sendo serviços externos. Os comentários e curtidas têm o comportamento local da página original, sem banco de dados.

## App de receitas

`/receitas` é uma aplicação independente da página de vendas, com busca por nome/ingrediente, oito categorias, favoritos locais, lista de compras, ajuste de porções e modo de preparo. O plano Essencial recebe 365 receitas; o Completo recebe 500. O app oferece instruções para adicionar um atalho à tela inicial e requer internet para consultar conteúdo.

As receitas são propostas editoriais e variações de preparos conhecidos, não receitas testadas em cozinha. Não há validação nutricional nem promessa de adequação clínica. O conteúdo usa a expressão “sem adição de açúcar” e explica açúcares naturais, alergênicos e cuidados de preparo. As imagens representam categorias ou preparações ilustrativas.

### Acesso e conteúdo privado

As funções `api/recipe-access.mjs` e `api/recipes.mjs` validam o acesso no servidor. Uma sessão assinada, HttpOnly e válida por sete dias determina quais receitas podem ser consultadas, inclusive por ID. Os códigos compartilhados não verificam compras individuais e podem ser repassados. A limitação de tentativas é apenas por instância; não substitui um controle distribuído de abuso.

As variáveis `RECIPE_SECRET` (32 bytes aleatórios em base64), `RECIPE_ESSENTIAL_CODE` e `RECIPE_COMPLETE_CODE` ficam na Vercel e em `.env.local` ignorado pelo Git. Nunca devem ir para arquivos públicos, logs ou commits. O catálogo versionado em `private/recipes.enc.json` é criptografado com AES-256-GCM; a chave não deve ser trocada sem recriptografar o catálogo e publicar os dois juntos.

O conteúdo editorial editável e seu gerador ficam em `private-source/`, também ignorado pelo Git. Após editar `private-source/recipes.json`, execute `npm run recipes:seal`, `npm test` e `npm run build`. Faça backup privado do conteúdo editorial e da chave: o clone público sozinho não consegue recuperar as receitas. Os testes completos exigem a chave local correspondente ao catálogo criptografado.

O fluxo de compra não foi alterado nem integrado a uma plataforma de checkout. Configure na plataforma a entrega do endereço `/receitas` e do código correspondente ao plano adquirido.
