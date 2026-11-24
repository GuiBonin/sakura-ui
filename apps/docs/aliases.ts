import { resolve } from 'node:path';

const libSrc = resolve(import.meta.dirname, '../../packages/sakura-ui/src');

/** O site usa o código-fonte da lib direto, então mudanças aparecem sem rebuild. */
export const aliases = [
  { find: /^@guibonin\/sakura-ui\/styles\.css$/, replacement: resolve(libSrc, 'styles/index.css') },
  { find: /^@guibonin\/sakura-ui$/, replacement: resolve(libSrc, 'index.ts') },
];
