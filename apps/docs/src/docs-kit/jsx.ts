/** `{ expr: 'cores' }` vira `prop={cores}` no código gerado. */
export type JsxExpression = { expr: string };
export type PropValue = string | number | boolean | undefined | null | JsxExpression;

function formatProp(name: string, value: PropValue): string | null {
  if (value === undefined || value === null || value === false) return null;
  if (value === true) return name;
  if (typeof value === 'number') return `${name}={${value}}`;
  if (typeof value === 'object') return `${name}={${value.expr}}`;
  return `${name}="${value.replace(/"/g, '&quot;')}"`;
}

/**
 * Gera o JSX de um componente a partir das props atuais do playground.
 * Props iguais ao padrão são omitidas para o código ficar enxuto.
 *
 * toJsx('Button', { variant: 'soft', disabled: true }, 'Salvar')
 * → '<Button variant="soft" disabled>Salvar</Button>'
 */
export function toJsx(
  component: string,
  props: Record<string, PropValue>,
  children?: string,
  defaults: Record<string, PropValue> = {},
): string {
  const attrs = Object.entries(props)
    .filter(([name, value]) => defaults[name] !== value)
    .map(([name, value]) => formatProp(name, value))
    .filter((attr): attr is string => attr !== null);

  const oneLine = `<${component}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  const open =
    oneLine.length > 80 ? `<${component}\n${attrs.map((a) => `  ${a}`).join('\n')}\n` : oneLine;

  if (children === undefined || children === '')
    return `${open}${open.endsWith('\n') ? '' : ' '}/>`;
  return `${open}>${children}</${component}>`;
}
