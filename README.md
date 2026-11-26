# Apex Motors · site demonstrativo

**Demo ao vivo:** https://gustavotavaresai.com.br/projetos/apex-motors/

Site de uma concessionária premium **fictícia**, feito como peça de portfólio.
A proposta foi criar uma experiência com cara de produto de luxo sem WebGL,
sem 3D e sem vídeo: tudo é HTML, CSS, SVG, fotografia tratada e animação
guiada pela rolagem.

## Destaques técnicos

- **Astro + TypeScript**, site 100% estático
- **GSAP + ScrollTrigger** para animações ligadas à rolagem, com
  `prefers-reduced-motion` respeitado (versão sem movimento)
- **Lenis** para rolagem suave
- Imagens otimizadas no build (AVIF/WebP em várias larguras) e tratamento
  de cor automatizado em **Python** (`scripts/process-images.py`)
- Design system próprio em CSS (tokens de cor, tipografia e componentes)
- Responsivo, com navegação por teclado e swipe no estoque em telas de toque

## Rodar localmente

Requer Node.js 22.12 ou superior.

```bash
npm install
npm run dev      # http://127.0.0.1:4332/demos/automotivo/
npm run build    # astro check + build de produção
```

## Estrutura

```text
src/
  layouts/Base.astro              metadados, Open Graph, favicon
  pages/demos/automotivo/         a página da Apex Motors
  demos/automotivo/automotivo.ts  interações e animações da página
  demos/automotivo/automotivo.css design system da demo
  lib/motion.ts                   setup do GSAP/ScrollTrigger e Lenis
  lib/interactions.ts             menu, swipe, foco por teclado
scripts/process-images.py         tratamento de cor das fotos
```

## Créditos

Marca, textos e números são fictícios. As fotografias são do Unsplash
(licença de uso livre). Detalhes em [CREDITOS.md](CREDITOS.md).

---

Feito por **Gustavo Tavares** · [LinkedIn](https://www.linkedin.com/in/gustavotavaresai/) · [gustavotavaresai.com.br](https://gustavotavaresai.com.br)
