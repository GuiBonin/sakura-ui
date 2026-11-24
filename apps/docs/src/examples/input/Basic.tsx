import { Input } from '@guibonin/sakura-ui';

export default function Basic() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Input label="Nome completo" placeholder="Maria Silva" required />
      <Input label="Apelido" hint="Aparece no seu perfil público." />
    </div>
  );
}
