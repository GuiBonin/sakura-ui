import { Avatar } from '@guibonin/sakura-ui';

export default function Fallback() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      {/* A imagem não existe: o avatar mostra as iniciais. */}
      <Avatar src="./imagem-inexistente.png" name="Guilherme Bonin" size="lg" />
      {/* Sem nome nem imagem: mostra um ícone. */}
      <Avatar size="lg" />
    </div>
  );
}
