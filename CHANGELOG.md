# Changelog

Mudanças relevantes de cada versão. O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa [versionamento semântico](https://semver.org/lang/pt-BR/).

## [Não publicado]

### Adicionado

- Tons `info` e `neutral`, com tokens `--sk-info*` e `--sk-neutral*` nos dois temas.
- Prop `tone` no `Spinner` (inclui `current`, que herda a cor do texto).
- Tons `info` no `Badge` e `info` e `neutral` na `ProgressBar`.
- Tokens `--sk-indicator`, `--sk-indicator-start`, `--sk-indicator-end`, `--sk-warning-strong` e `--sk-danger-active`.
- Seção "Cores por função" e exemplo de tema próprio na página de Temas.

### Alterado

- No tema claro, `Spinner` e `ProgressBar` usam violeta e o gradiente vinho para violeta. O rosa Sakura sobre branco ficava abaixo do contraste de 3:1 exigido para elementos gráficos. No escuro, continuam rosa.
- `ProgressBar` e `Toast` no tom `warning` usam um amarelo mais escuro no tema claro.
- O `Toast` no tom `info` usa a cor info (azul lavanda) em vez do violeta de destaque.
- Botão `danger` ganhou cor própria ao ser pressionado.
- Botão e `Switch` desabilitados não baixam mais a opacidade do conteúdo inteiro, e o rótulo continua legível.
- Botões de fechar do `Modal` e do `Toast` têm área de clique de 40px.
- Hover no `Switch` desligado, anel de foco no `Card` interativo e raio menor no campo pequeno, igual ao botão pequeno.

## [0.1.0] - 2026-11-24

Primeira versão.

### Adicionado

- 17 componentes: Button, Input, Select, Checkbox, Switch, Modal, Card, Accordion, Tooltip, Dropdown, Toast, Tabs, Badge, Avatar, Progress Bar, Skeleton e Spinner.
- `SakuraProvider` com tema claro, escuro e do sistema, persistência da escolha, configuração de movimento reduzido e notificações.
- Tokens de design em variáveis CSS com a paleta Sakura e contraste AA testado nos dois temas.
- Hooks públicos: `useTheme`, `useToast`, `useControllableState`, `useFocusTrap`, `useEscape`, `useClickOutside`, `useMediaQuery`, `usePrefersReducedMotion`, `useScrollLock` e `useFloatingPosition`.
- Saída ESM e CommonJS com tipos para os dois formatos e diretiva `"use client"`.
- Site de documentação com playground, exemplos copiáveis e guias.

[Não publicado]: https://github.com/GuiBonin/sakura-ui/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GuiBonin/sakura-ui/releases/tag/v0.1.0
