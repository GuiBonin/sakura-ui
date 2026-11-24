# Contribuindo com a Sakura UI

Obrigado pelo interesse! Este guia explica como preparar o ambiente, o que esperamos de uma contribuição e como uma versão é publicada.

## Preparando o ambiente

Requisitos: Node 20.19 ou mais novo e npm 10 ou mais novo.

```bash
git clone https://github.com/GuiBonin/sakura-ui.git
cd sakura-ui
npm install
npm run dev
```

O site de documentação abre em `http://localhost:5173` e usa o código-fonte da biblioteca direto, então qualquer mudança em `packages/sakura-ui/src` aparece na hora.

## Estrutura

```
packages/sakura-ui/
  src/components/<Nome>/   Nome.tsx, Nome.css, Nome.test.tsx
  src/hooks/               hooks compartilhados
  src/styles/              tokens (cores, espaçamento, camadas) e base
  src/theme/               SakuraProvider e ThemeProvider
  test/                    setup do Vitest, helper do axe, mocks
apps/docs/
  src/examples/            exemplos exibidos no site (o código mostrado é o próprio arquivo)
  src/content/             registro de documentação de cada componente
  src/pages/               páginas do site
scripts/                   verificação do pacote antes de publicar
```

## O que uma contribuição precisa ter

- **Testes para todo comportamento novo**: renderização, variantes, teclado, foco, estados controlado e não controlado, e uma checagem com `axeViolations`. Correção de bug vem com um teste que falha sem a correção.
- **Acessibilidade**: siga o padrão correspondente do [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/). Cores novas precisam passar no teste de contraste de `tokens.test.ts`.
- **Movimento reduzido**: animação em loop ou deslocamento no hover precisa de um bloco `@media (prefers-reduced-motion: reduce)`. Há um teste que verifica isso.
- **Documentação**: componente ou prop nova entra em `apps/docs/src/content/components.tsx`, com exemplo em `apps/docs/src/examples`.
- **Nada de credenciais**: não inclua tokens, senhas, e-mails pessoais ou arquivos `.env`.

Antes de abrir o pull request, rode:

```bash
npm run lint && npm run format:check && npm run typecheck && npm test && npm run build
```

## Mensagens de commit

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`, `ci:`, `build:` ou `perf:`, seguido de uma frase curta no imperativo.

```
fix: impede que o Esc feche o modal junto com a lista do Select
```

## Publicando uma versão

A publicação é feita pelo GitHub Actions (`.github/workflows/release.yml`) usando trusted publishing do npm, sem token guardado no repositório.

1. Atualize a versão em `packages/sakura-ui/package.json` e em `VERSION` (`packages/sakura-ui/src/index.ts`). Um teste garante que as duas batem.
2. Registre as mudanças no [CHANGELOG](./CHANGELOG.md).
3. Faça o commit, crie a tag e envie:

   ```bash
   git tag v0.2.0
   git push origin main --tags
   ```

O workflow confere se a tag bate com a versão, roda lint, tipos, testes e `check:package`, publica com provenance e cria o release no GitHub.

### Configuração única

- **npm**: em npmjs.com, nas configurações do pacote, adicione um _trusted publisher_ do GitHub Actions apontando para `GuiBonin/sakura-ui`, workflow `release.yml` e environment `npm`. Se o npm não permitir configurar isso antes da primeira versão existir, publique a primeira manualmente com `npm login` e `npm publish -w @guibonin/sakura-ui --access public`.
- **GitHub Pages**: em Settings > Pages, escolha a origem "GitHub Actions". O site é publicado pelo workflow `docs.yml`.
