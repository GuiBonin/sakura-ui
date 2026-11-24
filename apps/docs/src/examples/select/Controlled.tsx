import { Badge, Select } from '@guibonin/sakura-ui';
import { useState } from 'react';

const planos = [
  { value: 'free', label: 'Gratuito' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Equipe' },
];

export default function Controlled() {
  const [plano, setPlano] = useState<string | null>('pro');

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Select label="Plano" options={planos} value={plano} onValueChange={setPlano} />
      <p style={{ margin: 0 }}>
        Selecionado: <Badge tone="accent">{plano ?? 'nenhum'}</Badge>
      </p>
    </div>
  );
}
