<div align="center">

# 🌸 Sakura UI

**Componentes React modernos, acessíveis e com tema claro e escuro.**

[![CI](https://github.com/GuiBonin/sakura-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/GuiBonin/sakura-ui/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@guibonin/sakura-ui?color=d88ca5)](https://www.npmjs.com/package/@guibonin/sakura-ui)
[![Licença MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-9265b5)](./LICENSE)

**[Ver o site ao vivo →](https://guibonin.github.io/sakura-ui/)**

[Começando](https://guibonin.github.io/sakura-ui/#/comecando) ·
[Componentes](https://guibonin.github.io/sakura-ui/#/componentes/button) ·
[Temas](https://guibonin.github.io/sakura-ui/#/temas) ·
[Acessibilidade](https://guibonin.github.io/sakura-ui/#/acessibilidade)

<a href="https://guibonin.github.io/sakura-ui/">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/GuiBonin/sakura-ui/main/.github/assets/preview-dark.png" />
    <img
      src="https://raw.githubusercontent.com/GuiBonin/sakura-ui/main/.github/assets/preview-light.png"
      alt="Página inicial da Sakura UI: título 'Componentes React que florescem em qualquer interface', botões Começar agora e Ver componentes e o comando de instalação"
      width="860"
    />
  </picture>
</a>

</div>

---

## Por que Sakura UI

- **Acessível de verdade.** Os componentes seguem os padrões do WAI-ARIA Authoring Practices, funcionam inteiros pelo teclado e passam pelo axe-core nos testes. O contraste AA dos dois temas é verificado automaticamente.
- **Tema claro e escuro.** Segue o sistema por padrão, guarda a escolha da pessoa e muda tudo com variáveis CSS.
- **Animações com calma.** Transições com Framer Motion que respeitam `prefers-reduced-motion`.
- **TypeScript do início ao fim.** Props tipadas, `ref` repassada e componentes controlados ou não.
- **Leve para integrar.** Um arquivo de CSS, classes com prefixo `sk-` e bundle pronto para ESM, CommonJS e SSR (`"use client"` incluso).

## Instalação

```bash
npm install @guibonin/sakura-ui
```

Precisa de React 18 ou 19. Framer Motion e Lucide Icons já vêm como dependências.

## Uso rápido

```tsx
import '@guibonin/sakura-ui/styles.css';
import { Button, SakuraProvider, useToast } from '@guibonin/sakura-ui';

function Salvar() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: 'Salvo!', tone: 'success' })}>Salvar</Button>;
}

export function App() {
  return (
    <SakuraProvider>
      <Salvar />
    </SakuraProvider>
  );
}
```

O `SakuraProvider` cuida do tema, configura as animações para o movimento reduzido e habilita as notificações.

## Componentes

| Categoria    | Componentes                            |
| ------------ | -------------------------------------- |
| Ações        | Button, Dropdown                       |
| Formulários  | Input, Select, Checkbox, Switch        |
| Exibição     | Card, Accordion, Tabs, Badge, Avatar   |
| Feedback     | Toast, Progress Bar, Skeleton, Spinner |
| Sobreposição | Modal, Tooltip                         |

Cada componente tem playground, exemplos com código para copiar, tabela de props e notas de acessibilidade na [documentação](https://guibonin.github.io/sakura-ui/).

Também são exportados os hooks usados internamente: `useTheme`, `useToast`, `useControllableState`, `useFocusTrap`, `useEscape`, `useClickOutside`, `useMediaQuery`, `usePrefersReducedMotion`, `useScrollLock` e `useFloatingPosition`.

## Temas

```tsx
import { useTheme } from '@guibonin/sakura-ui';

function BotaoTema() {
  const { resolvedTheme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Tema: {resolvedTheme}</button>;
}
```

Para personalizar, sobrescreva os tokens depois de importar o CSS:

```css
:root {
  --sk-primary: #f0a35e;
  --sk-primary-fg: #151218;
}

[data-theme='dark'] {
  --sk-bg: #0f0d12;
}
```

### Paleta

| Cor          | Hex       | Token              |
| ------------ | --------- | ------------------ |
| Preto carvão | `#151218` | `--sk-charcoal`    |
| Rosa Sakura  | `#D88CA5` | `--sk-sakura`      |
| Rosa suave   | `#E8B4C8` | `--sk-sakura-soft` |
| Violeta      | `#9265B5` | `--sk-violet`      |
| Roxo escuro  | `#51345F` | `--sk-plum`        |

## Acessibilidade

- Teclado completo nos padrões do APG: Select (combobox), Dropdown (menu button), Tabs, Accordion, Modal com foco preso e Tooltip.
- Esc fecha uma camada por vez: um Select aberto dentro de um Modal fecha antes do modal.
- Notificações em regiões `aria-live`; erros são anunciados na hora.
- Contraste mínimo de 4,5:1 para texto e 3:1 para bordas de campo e foco, nos dois temas.

Detalhes em [Acessibilidade](https://guibonin.github.io/sakura-ui/#/acessibilidade).

## Desenvolvimento

O repositório é um monorepo com npm workspaces:

```
packages/sakura-ui   a biblioteca publicada no npm
apps/docs            o site de documentação
```

```bash
npm install            # instala tudo
npm run dev            # site de documentação em modo desenvolvimento
npm test               # testes (Vitest + Testing Library + axe-core)
npm run test:coverage  # testes com cobertura
npm run lint           # ESLint
npm run format         # Prettier
npm run typecheck      # TypeScript
npm run build          # build da biblioteca e do site
npm run check:package  # valida o pacote como seria publicado
```

Quer contribuir? Leia o [guia de contribuição](./CONTRIBUTING.md). Para reportar uma vulnerabilidade, siga a [política de segurança](./SECURITY.md).

## Licença

[MIT](./LICENSE) © Guilherme Bonin
