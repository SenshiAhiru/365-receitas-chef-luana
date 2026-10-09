# 365 Receitas — Chef Luana

Cópia da página pública https://as365receitascheflu.lovable.app/, recuperada em 09/10/2026 a pedido do proprietário, para preservar a versão atual antes de melhorias.

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

Layout, textos, preços, links de checkout e integrações UTMify foram preservados. Apenas os scripts de telemetria exclusivos da infraestrutura Lovable foram removidos, pois seus endpoints não existem nesta hospedagem. Google Fonts e UTMify continuam sendo serviços externos. Os comentários e curtidas têm o comportamento local da página original, sem banco de dados.
