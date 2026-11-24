import { ExternalLink, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { categories, components } from '../content/components';
import { ThemeToggle } from './ThemeToggle';

export const GITHUB_URL = 'https://github.com/GuiBonin/sakura-ui';

const guides = [
  { to: '/comecando', label: 'Começando' },
  { to: '/temas', label: 'Temas' },
  { to: '/acessibilidade', label: 'Acessibilidade' },
];

function Logo() {
  return (
    <Link to="/" className="docs-logo" aria-label="Sakura UI, página inicial">
      <svg viewBox="0 0 64 64" width="28" height="28" aria-hidden="true">
        <g transform="translate(32 32)">
          {[0, 72, 144, 216, 288].map((angle) => (
            <path
              key={angle}
              d="M0 -4 C-9 -12 -10 -24 0 -28 C10 -24 9 -12 0 -4Z"
              fill="#D88CA5"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle r="5" fill="#9265B5" />
        </g>
      </svg>
      <span>Sakura UI</span>
    </Link>
  );
}

/** Pula o cabeçalho e leva o foco direto ao conteúdo principal. */
function SkipLink() {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    // Com HashRouter, "#conteudo" viraria uma rota: o foco é movido manualmente.
    event.preventDefault();
    const main = document.getElementById('conteudo');
    main?.focus();
    main?.scrollIntoView?.();
  };
  return (
    <a href="#conteudo" className="docs-skip" onClick={onClick}>
      Pular para o conteúdo
    </a>
  );
}

function Header({ onMenu, menuOpen }: { onMenu?: () => void; menuOpen?: boolean }) {
  return (
    <header className="docs-header">
      <div className="docs-header__inner">
        {onMenu && (
          <button
            type="button"
            className="docs-menu-button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="docs-sidebar"
            onClick={onMenu}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        )}
        <Logo />
        <nav className="docs-header__nav" aria-label="Principal">
          <NavLink to="/comecando">Documentação</NavLink>
          <NavLink to="/componentes/button">Componentes</NavLink>
        </nav>
        <div className="docs-header__actions">
          <ThemeToggle />
          <a className="docs-github" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
            <ExternalLink aria-hidden="true" />
            <span className="sk-visually-hidden"> (abre em nova aba)</span>
          </a>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="docs-footer">
      <p>
        Feito por Guilherme Bonin ·{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        · Licença MIT
      </p>
    </footer>
  );
}

/** Rola para o topo e coloca o foco no conteúdo a cada troca de página. */
function useRouteFocus() {
  const { pathname } = useLocation();
  // Guarda a rota anterior em vez de um "primeira vez": no StrictMode o efeito
  // roda duas vezes na montagem e o foco ia para o conteúdo ao abrir a página.
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    window.scrollTo?.(0, 0);
    document.getElementById('conteudo')?.focus({ preventScroll: true });
  }, [pathname]);
}

/** Menu lateral: fixo no desktop das páginas de documentação, gaveta no celular. */
function Sidebar({ open, mobileOnly = false }: { open: boolean; mobileOnly?: boolean }) {
  return (
    <aside
      id="docs-sidebar"
      className={mobileOnly ? 'docs-sidebar docs-sidebar--mobile-only' : 'docs-sidebar'}
      data-open={open || undefined}
    >
      <nav aria-label="Documentação">
        <p className="docs-sidebar__heading">Guias</p>
        <ul>
          {guides.map((guide) => (
            <li key={guide.to}>
              <NavLink to={guide.to}>{guide.label}</NavLink>
            </li>
          ))}
        </ul>
        {categories.map((category) => (
          <div key={category}>
            <p className="docs-sidebar__heading">{category}</p>
            <ul>
              {components
                .filter((component) => component.category === category)
                .map((component) => (
                  <li key={component.slug}>
                    <NavLink to={`/componentes/${component.slug}`}>{component.name}</NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

/** Estado da gaveta do celular, fechada a cada troca de página. */
function useMobileMenu() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  return { open, toggle: () => setOpen((value) => !value) };
}

/** Layout da página inicial: sem menu lateral no desktop, com gaveta no celular. */
export function SiteLayout() {
  const menu = useMobileMenu();
  useRouteFocus();
  return (
    <div className="docs-shell">
      <SkipLink />
      <Header onMenu={menu.toggle} menuOpen={menu.open} />
      <Sidebar open={menu.open} mobileOnly />
      <main id="conteudo" tabIndex={-1} className="docs-main docs-main--full">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Layout das páginas de documentação, com menu lateral. */
export function DocsLayout() {
  const menu = useMobileMenu();
  useRouteFocus();
  return (
    <div className="docs-shell">
      <SkipLink />
      <Header onMenu={menu.toggle} menuOpen={menu.open} />
      <div className="docs-body">
        <Sidebar open={menu.open} />
        <main id="conteudo" tabIndex={-1} className="docs-main">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
}
