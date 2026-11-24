import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/*
 * Verificações do repositório como um todo: metadados de publicação,
 * workflows coerentes com os scripts e ausência de credenciais.
 */
const root = resolve(import.meta.dirname, '../../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');
const json = (path: string) => JSON.parse(read(path));

const pkg = json('packages/sakura-ui/package.json');
const rootPkg = json('package.json');

describe('package.json da biblioteca', () => {
  it('tem nome, licença, autor sem e-mail e repositório corretos', () => {
    expect(pkg.name).toBe('@guibonin/sakura-ui');
    expect(pkg.license).toBe('MIT');
    expect(pkg.author).toBe('Guilherme Bonin');
    expect(pkg.repository.url).toBe('git+https://github.com/GuiBonin/sakura-ui.git');
    expect(pkg.publishConfig.access).toBe('public');
  });

  it('publica só a pasta dist e declara efeitos colaterais apenas no CSS', () => {
    expect(pkg.files).toEqual(['dist']);
    expect(pkg.sideEffects).toEqual(['*.css']);
  });

  it('exports apontam para os arquivos que o build gera', () => {
    const targets = [
      pkg.exports['.'].import.types,
      pkg.exports['.'].import.default,
      pkg.exports['.'].require.types,
      pkg.exports['.'].require.default,
      pkg.exports['./styles.css'],
    ];
    expect(targets).toEqual([
      './dist/index.d.ts',
      './dist/index.js',
      './dist/index.d.cts',
      './dist/index.cjs',
      './dist/styles.css',
    ]);
    expect([pkg.main, pkg.module, pkg.types]).toEqual([
      './dist/index.cjs',
      './dist/index.js',
      './dist/index.d.ts',
    ]);
  });

  it('React é peer dependency e não dependência direta', () => {
    expect(pkg.peerDependencies).toMatchObject({ react: '>=18', 'react-dom': '>=18' });
    expect(pkg.dependencies).not.toHaveProperty('react');
    expect(pkg.dependencies).toHaveProperty('framer-motion');
    expect(pkg.dependencies).toHaveProperty('lucide-react');
  });

  it('copia README e LICENSE antes de empacotar', () => {
    expect(pkg.scripts.prepack).toContain('copy-package-files.mjs');
    execFileSync(process.execPath, [join(root, 'scripts/copy-package-files.mjs')]);
    expect(read('packages/sakura-ui/README.md')).toBe(read('README.md'));
    expect(read('packages/sakura-ui/LICENSE')).toBe(read('LICENSE'));
  });
});

describe('documentos do projeto', () => {
  it('licença MIT com o autor', () => {
    const license = read('LICENSE');
    expect(license).toMatch(/^MIT License/);
    expect(license).toContain('Copyright (c) 2026 Guilherme Bonin');
  });

  it('README em português cobre instalação, uso, componentes, temas e licença', () => {
    const readme = read('README.md');
    for (const section of [
      '## Instalação',
      '## Uso rápido',
      '## Componentes',
      '## Temas',
      '## Acessibilidade',
      '## Licença',
    ]) {
      expect(readme).toContain(section);
    }
    expect(readme).toContain('npm install @guibonin/sakura-ui');
  });

  it.each(['CONTRIBUTING.md', 'CHANGELOG.md', 'CODE_OF_CONDUCT.md', 'SECURITY.md'])(
    '%s existe',
    (file) => {
      expect(existsSync(join(root, file))).toBe(true);
    },
  );

  it('CHANGELOG registra a versão atual', () => {
    expect(read('CHANGELOG.md')).toContain(`## [${pkg.version}]`);
  });
});

describe('workflows do GitHub Actions', () => {
  const scripts = rootPkg.scripts as Record<string, string>;

  it.each(['ci.yml', 'release.yml', 'docs.yml'])('%s só chama scripts que existem', (file) => {
    const content = read(`.github/workflows/${file}`);
    for (const [, script] of content.matchAll(/npm run ([\w:-]+)(?![\w:-]| -w)/g)) {
      expect(scripts, `script "${script}" usado em ${file}`).toHaveProperty(script!);
    }
  });

  it('release publica com provenance via OIDC, sem token salvo', () => {
    const release = read('.github/workflows/release.yml');
    expect(release).toContain('id-token: write');
    expect(release).toContain('--provenance');
    expect(release).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/);
    expect(release).toContain("tags: ['v*.*.*']");
  });

  it('release confere a tag contra a versão do pacote', () => {
    expect(read('.github/workflows/release.yml')).toContain('"v$VERSION" != "$GITHUB_REF_NAME"');
  });

  it('docs publica o build do site no GitHub Pages', () => {
    const docs = read('.github/workflows/docs.yml');
    expect(docs).toContain('npm run build -w docs');
    expect(docs).toContain('path: apps/docs/dist');
    expect(docs).toContain('actions/deploy-pages');
  });

  it.each(['ci.yml', 'release.yml', 'docs.yml'])(
    '%s fixa toda action por SHA completo e não guarda credenciais do checkout',
    (file) => {
      const content = read(`.github/workflows/${file}`);
      const uses = [...content.matchAll(/uses: ([^\s]+)/g)].map((match) => match[1]!);
      expect(uses.length).toBeGreaterThan(0);
      for (const action of uses) expect(action).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/);
      const checkouts = content.split('actions/checkout@').length - 1;
      const persisted = content.split('persist-credentials: false').length - 1;
      expect(persisted).toBe(checkouts);
    },
  );

  it('release não usa cache de dependências', () => {
    expect(read('.github/workflows/release.yml')).not.toMatch(/^\s*cache:/m);
  });

  it('nenhum workflow usa gatilhos que rodam código de fork com permissões', () => {
    for (const file of ['ci.yml', 'release.yml', 'docs.yml']) {
      expect(read(`.github/workflows/${file}`)).not.toMatch(/pull_request_target|workflow_run/);
    }
  });

  it('nenhum workflow interpola expressões dentro de comandos run', () => {
    for (const file of ['ci.yml', 'release.yml', 'docs.yml']) {
      const lines = read(`.github/workflows/${file}`).split('\n');
      let runIndent = -1;
      for (const line of lines) {
        const indent = line.length - line.trimStart().length;
        const runMatch = /^(\s*)(?:- )?run: ?(.*)$/.exec(line);
        if (runMatch) {
          expect(line, `${file}: ${line}`).not.toContain('${{');
          runIndent = runMatch[2] === '|' ? indent : -1;
          continue;
        }
        if (runIndent >= 0 && line.trim() !== '' && indent <= runIndent) runIndent = -1;
        if (runIndent >= 0) expect(line, `${file}: ${line}`).not.toContain('${{');
      }
    }
  });

  it('dependabot acompanha actions e npm', () => {
    const dependabot = read('.github/dependabot.yml');
    expect(dependabot).toContain('package-ecosystem: github-actions');
    expect(dependabot).toContain('package-ecosystem: npm');
  });

  it('CI valida o pacote e roda em várias versões do Node', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toContain('npm run check:package');
    expect(ci).toMatch(/node: \[20, 22, 24\]/);
  });
});

describe('package-lock.json', () => {
  type LockEntry = {
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    peerDependenciesMeta?: Record<string, { optional?: boolean }>;
  };
  const lock = json('package-lock.json') as { packages: Record<string, LockEntry> };

  // Procura a dependência como o Node faria: subindo pelos node_modules.
  function resolves(from: string, name: string) {
    let base = from;
    while (true) {
      const candidate = `${base ? `${base}/` : ''}node_modules/${name}`;
      if (lock.packages[candidate]) return true;
      if (lock.packages[name] || lock.packages[`node_modules/${name}`]) return true;
      const index = base.lastIndexOf('node_modules/');
      if (index === -1) return false;
      base = base.slice(0, index).replace(/\/$/, '');
    }
  }

  /*
   * O npm no Windows às vezes omite dependências opcionais de outras
   * plataformas (como o binding WASM do Rolldown) e o `npm ci` do Linux falha
   * com "Missing: ... from lock file". Esta é a mesma verificação, feita aqui.
   */
  it('toda dependência declarada no lock tem entrada no próprio lock', () => {
    const missing: string[] = [];
    for (const [path, entry] of Object.entries(lock.packages)) {
      const required = { ...entry.dependencies, ...entry.optionalDependencies };
      for (const [name, range] of Object.entries(entry.peerDependencies ?? {})) {
        // Peers não opcionais de pacotes instalados também precisam existir.
        if (!entry.peerDependenciesMeta?.[name]?.optional) required[name] = range;
      }
      for (const name of Object.keys(required)) {
        if (!resolves(path, name)) missing.push(`${path || '(raiz)'} → ${name}`);
      }
    }
    expect(missing).toEqual([]);
  });
});

describe('sem credenciais nem dados privados', () => {
  // Arquivos versionados e novos (respeitando o .gitignore).
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .filter((file) => existsSync(join(root, file)))
    .filter((file) => !/\.(png|jpe?g|gif|ico|woff2?)$/.test(file));

  const patterns: Array<[string, RegExp]> = [
    ['token do npm', /npm_[A-Za-z0-9]{36}/],
    ['token do GitHub', /gh[pousr]_[A-Za-z0-9]{30,}/],
    ['chave privada', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ['chave da AWS', /AKIA[0-9A-Z]{16}/],
    ['chave da OpenAI ou Anthropic', /sk-(?:ant-)?[A-Za-z0-9_-]{32,}/],
    ['atribuição de senha', /(?:password|senha|secret)\s*[:=]\s*['"][^'"\s]{8,}['"]/i],
  ];

  it('encontra arquivos para verificar', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('nenhum arquivo .env versionado', () => {
    expect(files.filter((file) => /(^|\/)\.env(\.|$)/.test(file))).toEqual([]);
  });

  it.each(patterns)('nenhum %s nos arquivos', (_name, pattern) => {
    const hits = files.filter((file) => pattern.test(readFileSync(join(root, file), 'utf8')));
    expect(hits).toEqual([]);
  });

  it('nenhum e-mail pessoal (só endereços de exemplo e noreply)', () => {
    const allowed = /@(exemplo\.com|empresa\.com\.br|anthropic\.com|users\.noreply\.github\.com)$/;
    const hits: string[] = [];
    for (const file of files.filter((f) => f !== 'package-lock.json')) {
      for (const [email] of readFileSync(join(root, file), 'utf8').matchAll(
        /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g,
      )) {
        if (!allowed.test(email) && !email.startsWith('@')) hits.push(`${file}: ${email}`);
      }
    }
    expect(hits).toEqual([]);
  });
});
