import { useEffect } from 'react';

/** Define o título da aba: "Página · Sakura UI". */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Sakura UI` : 'Sakura UI';
  }, [title]);
}
