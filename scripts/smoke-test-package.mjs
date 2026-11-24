// Empacota a biblioteca como o npm publicaria, instala o .tgz num projeto
// temporário e confere que ESM, CJS, tipos e CSS funcionam para quem consome.
// Uso: node scripts/smoke-test-package.mjs
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkgDir = join(root, 'packages', 'sakura-ui');
// Rodando via `npm run`, o npm informa o próprio caminho: chamamos com o Node,
// sem shell, o que funciona igual no Windows e no Linux.
const npmCli = process.env.npm_execpath;
const run = (args, cwd) =>
  npmCli
    ? execFileSync(process.execPath, [npmCli, ...args], { cwd, encoding: 'utf8' })
    : execFileSync('npm', args, { cwd, encoding: 'utf8' });

const work = mkdtempSync(join(tmpdir(), 'sakura-smoke-'));
let failed = false;
const check = (ok, message) => {
  console.log(`${ok ? '✓' : '✗'} ${message}`);
  if (!ok) failed = true;
};

try {
  const packed = JSON.parse(run(['pack', '--json', '--pack-destination', work], pkgDir));
  const { filename, files } = packed[0];
  const paths = files.map((file) => file.path);
  check(
    paths.includes('README.md') && paths.includes('LICENSE'),
    'tarball inclui README e LICENSE',
  );
  check(
    paths.every(
      (path) => path.startsWith('dist/') || ['README.md', 'LICENSE', 'package.json'].includes(path),
    ),
    'tarball só tem dist, README, LICENSE e package.json',
  );

  writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'consumidor', private: true }));
  run(
    ['install', '--no-audit', '--no-fund', join(work, filename), 'react@19', 'react-dom@19'],
    work,
  );

  writeFileSync(
    join(work, 'esm.mjs'),
    `import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { Button, SakuraProvider, VERSION } from '@guibonin/sakura-ui';
const html = renderToString(createElement(SakuraProvider, null, createElement(Button, null, 'Olá')));
console.log(JSON.stringify({ html, VERSION }));`,
  );
  const esm = JSON.parse(
    execFileSync(process.execPath, ['esm.mjs'], { cwd: work, encoding: 'utf8' }),
  );
  check(
    esm.html.includes('sk-button') && esm.html.includes('Olá'),
    'ESM: import e renderização no servidor',
  );

  writeFileSync(
    join(work, 'cjs.cjs'),
    `const { Badge } = require('@guibonin/sakura-ui');
const { renderToString } = require('react-dom/server');
const { createElement } = require('react');
console.log(renderToString(createElement(Badge, null, 'novo')));`,
  );
  const cjs = execFileSync(process.execPath, ['cjs.cjs'], { cwd: work, encoding: 'utf8' });
  check(cjs.includes('sk-badge'), 'CJS: require e renderização no servidor');

  const installed = join(work, 'node_modules', '@guibonin', 'sakura-ui');
  const pkg = JSON.parse(readFileSync(join(installed, 'package.json'), 'utf8'));
  const css = readFileSync(join(installed, pkg.exports['./styles.css']), 'utf8');
  check(
    css.includes('--sk-sakura') && css.includes('.sk-button'),
    'styles.css exportado com tokens e componentes',
  );
  check(existsSync(join(installed, 'dist', 'index.d.ts')), 'tipos ESM presentes');
  check(existsSync(join(installed, 'dist', 'index.d.cts')), 'tipos CJS presentes');
} finally {
  rmSync(work, { recursive: true, force: true });
}

if (failed) {
  console.error('\nSmoke test do pacote falhou.');
  process.exit(1);
}
console.log('\nPacote pronto para publicar.');
