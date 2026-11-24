import { SakuraProvider } from '@guibonin/sakura-ui';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { DocsLayout, SiteLayout } from './docs-kit/Layout';
import { Accessibility } from './pages/Accessibility';
import { ComponentPage } from './pages/ComponentPage';
import { GettingStarted } from './pages/GettingStarted';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';
import { Theming } from './pages/Theming';

/** Rotas do site. Separado do roteador para os testes usarem MemoryRouter. */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<Home />} />
      </Route>
      <Route element={<DocsLayout />}>
        <Route path="comecando" element={<GettingStarted />} />
        <Route path="temas" element={<Theming />} />
        <Route path="acessibilidade" element={<Accessibility />} />
        <Route path="componentes/:slug" element={<ComponentPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export function App() {
  return (
    <SakuraProvider>
      {/* HashRouter funciona no GitHub Pages sem configuração de servidor. */}
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </SakuraProvider>
  );
}
