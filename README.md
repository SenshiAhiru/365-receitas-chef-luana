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

Os preços de R$ 10 e R$ 18 foram preservados. Os links de checkout da oferta original foram removidos e os botões estão desabilitados como “Em breve” até a configuração do produto e dos novos links. As 11 seções foram mantidas; avaliações, números de compradores e descontos sem comprovação deram lugar a materiais previstos e orientações de uso. A entrega digital será detalhada no lançamento. As integrações UTMify foram preservadas. Os scripts de telemetria exclusivos da infraestrutura Lovable foram removidos, pois seus endpoints não existem nesta hospedagem. Google Fonts e UTMify continuam sendo serviços externos. Os antigos comentários e curtidas foram removidos.
