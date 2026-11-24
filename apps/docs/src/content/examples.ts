import type { ComponentType } from 'react';

const modules = import.meta.glob<{ default: ComponentType }>('../examples/**/*.tsx', {
  eager: true,
});
const sources = import.meta.glob<string>('../examples/**/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export interface LoadedExample {
  Component: ComponentType;
  source: string;
}

/**
 * Carrega um exemplo pelo caminho relativo a `src/examples`, como "button/Variants".
 * O código exibido é o próprio arquivo (via `?raw`), então nunca fica desatualizado.
 */
export function getExample(path: string): LoadedExample {
  const key = `../examples/${path}.tsx`;
  const module = modules[key];
  const source = sources[key];
  if (!module || source === undefined) throw new Error(`Exemplo não encontrado: ${path}`);
  return { Component: module.default, source };
}

/** Todos os caminhos de exemplo existentes, para validação nos testes. */
export const examplePaths = Object.keys(modules).map((key) =>
  key.replace('../examples/', '').replace(/\.tsx$/, ''),
);
