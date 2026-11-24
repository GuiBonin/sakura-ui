import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/*
 * O jsdom não avalia media queries de CSS, então este teste verifica o código:
 * todo arquivo de componente com animação em loop (`animation:`) ou movimento
 * no hover (`translate`) precisa ter um bloco `prefers-reduced-motion: reduce`.
 * Transições curtas já são cortadas globalmente em base.css.
 */
const componentsDir = resolve(import.meta.dirname, '../components');

const cssFiles = readdirSync(componentsDir, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.css'))
  .map((file) => [file, readFileSync(join(componentsDir, file), 'utf8')] as const);

const animated = cssFiles.filter(([, css]) => /animation:|translateY\(-/.test(css));

describe('prefers-reduced-motion', () => {
  it('encontra arquivos de componente para verificar', () => {
    expect(animated.length).toBeGreaterThan(0);
  });

  it.each(animated)('%s tem regra para movimento reduzido', (_file, css) => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });

  it('base.css corta transições de todos os componentes', () => {
    const base = readFileSync(resolve(import.meta.dirname, 'base.css'), 'utf8');
    expect(base).toMatch(/prefers-reduced-motion: reduce[\s\S]*transition-duration: 0\.01ms/);
  });
});
