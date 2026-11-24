/**
 * Copia texto para a área de transferência. Usa a Clipboard API quando existe
 * (contexto seguro) e cai para `execCommand('copy')` em navegadores antigos ou
 * páginas sem HTTPS. Devolve `true` quando conseguiu copiar.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permissão negada ou documento sem foco: tenta o método antigo.
    }
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  const previous = document.activeElement as HTMLElement | null;
  textarea.select();
  let ok = false;
  try {
    ok = typeof document.execCommand === 'function' && document.execCommand('copy');
  } catch {
    ok = false;
  }
  textarea.remove();
  previous?.focus?.();
  return ok;
}
