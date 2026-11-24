import type { Plugin } from 'vite';

/**
 * Política de segurança de conteúdo do site. O GitHub Pages não permite
 * definir cabeçalhos, então ela vai como <meta> no HTML gerado.
 * O site só carrega arquivos da própria origem. `style-src 'unsafe-inline'`
 * é necessário porque React, Framer Motion e o realce de código usam o
 * atributo style. Scripts inline continuam bloqueados.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

/** Injeta a CSP só no build: em desenvolvimento ela quebraria o HMR do Vite. */
export function contentSecurityPolicy(): Plugin {
  return {
    name: 'sakura-docs-csp',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler: () => [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
          injectTo: 'head-prepend',
        },
        {
          tag: 'meta',
          attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' },
          injectTo: 'head',
        },
      ],
    },
  };
}
