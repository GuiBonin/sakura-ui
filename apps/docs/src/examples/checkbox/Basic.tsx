import { Checkbox } from '@guibonin/sakura-ui';

export default function Basic() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Checkbox label="Aceito os termos de uso" />
      <Checkbox
        label="Receber novidades"
        description="No máximo um e-mail por semana."
        defaultChecked
      />
      <Checkbox label="Opção indisponível" disabled />
    </div>
  );
}
