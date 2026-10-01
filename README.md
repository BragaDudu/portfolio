# Eduardo Braga — Portfólio

Portfólio de desenvolvedor front-end, pensado para quem chega pelo link do currículo: em poucos segundos dá para ver quem eu sou, o que eu construí e **testar cada projeto sem sair da página**.

**Site:** https://bragadudu.github.io/portfolio/

## Destaques

- **Ver prévia** em cada projeto: telas, problema, solução, funcionalidades, tecnologias e uma **demo interativa** (com modo desktop e celular).
- **Link direto para cada projeto** (`#/projeto/sportstore`), útil para mandar a um recrutador.
- **Stack ligada aos projetos**: cada tecnologia mostra onde foi usada.
- Rápido: ~115 KB no primeiro carregamento, sem framework, sem fontes externas; demos e imagens grandes só carregam quando abertos.
- Acessível: HTML semântico, navegação por teclado, foco visível, `prefers-reduced-motion`, tema claro/escuro.
- SEO e compartilhamento: `title`, `description`, Open Graph com imagem própria, JSON-LD e favicon.

## Estrutura

```
portfolio/
├── index.html            # Página (hero, seções, modal de prévia)
├── assets/
│   ├── css/styles.css    # Estilos mobile-first + tema claro/escuro
│   ├── js/data.js        # ← CONTEÚDO: contatos, stack e projetos
│   ├── js/main.js        # Renderização, prévia, demo, tema
│   └── img/              # Foto, favicon, imagem de compartilhamento e screenshots
└── demos/                # Cópia estática de cada projeto, usada na demo interativa
```

## Como adicionar um projeto

1. Coloque a versão estática do projeto em `demos/<id>/` (precisa abrir pelo `index.html`).
2. Salve as imagens em `assets/img/projects/` em **WebP**: uma capa (~640px) e telas de até 1280px.
3. Adicione um objeto em `projects` no `assets/js/data.js`:

```js
{
  id: "meu-projeto",
  featured: false,                 // true = card grande no topo
  title: "Meu Projeto",
  kind: "Dashboard",
  summary: "Uma frase dizendo o que é.",
  problem: "Que problema resolve.",
  solution: "Como resolvi.",
  features: ["Funcionalidade 1", "Funcionalidade 2"],
  stack: ["html", "css", "js"],    // chaves de STACK
  origin: "Como foi feito (opcional).",
  github: "https://github.com/BragaDudu/meu-projeto",
  demo: "demos/meu-projeto/index.html",
  cover: "assets/img/projects/meu-projeto-thumb.webp",
  images: [{ src: "assets/img/projects/meu-projeto-1.webp", alt: "Descrição da tela" }],
  tryThis: "O que testar primeiro na demo.",
}
```

Ao mudar CSS ou JS, aumente o `?v=` dos três links no fim do `index.html`, para quem já visitou receber a versão nova.

Tecnologia nova? Adicione em `STACK` no mesmo arquivo. WhatsApp e currículo em PDF aparecem sozinhos quando preenchidos em `CONTACT`.

## Rodar localmente

```bash
python -m http.server 8000
```

Abra http://localhost:8000.
