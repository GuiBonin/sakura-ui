import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../docs-kit/useDocumentTitle';

export function NotFound() {
  useDocumentTitle('Página não encontrada');
  return (
    <article className="docs-article docs-notfound">
      <h1>Página não encontrada</h1>
      <p className="docs-lead">O endereço pode ter mudado ou estar escrito errado.</p>
      <Link className="docs-cta" to="/">
        Voltar para o início
      </Link>
    </article>
  );
}
