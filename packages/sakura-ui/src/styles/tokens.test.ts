import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Seletor ${selector} não encontrado em tokens.css`);
  const end = css.indexOf('\n}', start);
  const body = css.slice(start, end);
  const vars: Record<string, string> = {};
  for (const match of body.matchAll(/(--sk-[\w-]+):\s*([^;]+);/g)) {
    vars[match[1]!] = match[2]!.trim();
  }
  return vars;
}

const light = block(':root');
const dark = { ...light, ...block("[data-theme='dark']") };

function luminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

/** Pares de texto: precisam de 4,5:1 (WCAG AA). */
const textPairs: Array<[string, string]> = [
  ['fg', 'bg'],
  ['fg', 'surface'],
  ['fg', 'surface-2'],
  ['fg', 'surface-3'],
  ['fg-muted', 'bg'],
  ['fg-muted', 'surface'],
  ['fg-muted', 'surface-2'],
  ['fg-subtle', 'surface'],
  ['primary-fg', 'primary'],
  ['primary-fg', 'primary-hover'],
  ['primary-fg', 'primary-active'],
  ['primary-soft-fg', 'primary-soft'],
  ['accent-fg', 'accent'],
  ['accent-soft-fg', 'accent-soft'],
  ['emphasis', 'bg'],
  ['emphasis', 'surface'],
  ['danger', 'surface'],
  ['danger-fg', 'danger'],
  ['danger-fg', 'danger-hover'],
  ['danger-soft-fg', 'danger-soft'],
  ['success-fg', 'success'],
  ['success-soft-fg', 'success-soft'],
  ['warning-fg', 'warning'],
  ['warning-soft-fg', 'warning-soft'],
];

/** Pares de elementos de interface (bordas de campo, anel de foco): 3:1. */
const uiPairs: Array<[string, string]> = [
  ['ring', 'bg'],
  ['ring', 'surface'],
  ['border-strong', 'surface'],
  ['border-strong', 'bg'],
];

describe.each([
  ['claro', light],
  ['escuro', dark],
])('tokens do tema %s', (_name, tokens) => {
  const color = (name: string) => {
    const value = tokens[`--sk-${name}`];
    if (!value?.startsWith('#')) throw new Error(`--sk-${name} precisa ser uma cor hexadecimal`);
    return value;
  };

  it.each(textPairs)('texto %s sobre %s tem contraste AA (4,5:1)', (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(uiPairs)('elemento %s sobre %s tem contraste de 3:1', (fg, bg) => {
    expect(contrast(color(fg), color(bg))).toBeGreaterThanOrEqual(3);
  });
});

describe('paleta da marca', () => {
  it('mantém as cores oficiais', () => {
    expect(light['--sk-charcoal']).toBe('#151218');
    expect(light['--sk-sakura']).toBe('#d88ca5');
    expect(light['--sk-sakura-soft']).toBe('#e8b4c8');
    expect(light['--sk-violet']).toBe('#9265b5');
    expect(light['--sk-plum']).toBe('#51345f');
  });

  it('confirma que o rosa sakura não serve como texto no tema claro', () => {
    expect(contrast('#d88ca5', '#ffffff')).toBeLessThan(4.5);
  });

  it('define no tema escuro os mesmos tokens semânticos do claro', () => {
    const darkOnly = block("[data-theme='dark']");
    const semantic = Object.keys(light).filter((key) =>
      /^--sk-(bg|surface|fg|primary|accent|danger|success|warning|border|ring|emphasis|overlay|shadow)/.test(
        key,
      ),
    );
    for (const key of semantic) expect(darkOnly).toHaveProperty(key);
  });
});

describe('camadas (z-index)', () => {
  const z = (name: string) => Number(light[`--sk-z-${name}`]);

  it('menus e listas ficam acima do modal, porque podem abrir dentro dele', () => {
    expect(z('dropdown')).toBeGreaterThan(z('modal'));
  });

  it('segue a ordem overlay < modal < dropdown < toast < tooltip', () => {
    const order = ['overlay', 'modal', 'dropdown', 'toast', 'tooltip'].map(z);
    expect(order.every((value) => Number.isFinite(value))).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(new Set(order).size).toBe(order.length);
  });
});
