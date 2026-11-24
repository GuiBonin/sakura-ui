import axe from 'axe-core';

/**
 * Roda o axe-core no container e devolve as violações em formato legível.
 * A regra de contraste fica desligada porque o jsdom não calcula cores;
 * o contraste da paleta é verificado em tokens.test.ts.
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map(
    (violation) =>
      `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.html).join(', ')})`,
  );
}
