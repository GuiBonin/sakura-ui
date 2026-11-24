import { Spinner } from '@guibonin/sakura-ui';

export default function Sizes() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Carregando pedidos" />
    </div>
  );
}
