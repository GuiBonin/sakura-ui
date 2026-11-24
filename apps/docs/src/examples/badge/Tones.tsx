import { Badge } from '@guibonin/sakura-ui';
import { Check } from 'lucide-react';

export default function Tones() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Badge>Rascunho</Badge>
        <Badge tone="primary">Novo</Badge>
        <Badge tone="accent">Beta</Badge>
        <Badge tone="success" dot>
          Ativo
        </Badge>
        <Badge tone="warning">Pendente</Badge>
        <Badge tone="danger">Atrasado</Badge>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Badge appearance="solid" tone="primary">
          Solid
        </Badge>
        <Badge appearance="outline" tone="accent">
          Outline
        </Badge>
        <Badge appearance="solid" tone="success" icon={<Check />}>
          Pago
        </Badge>
        <Badge size="sm">sm</Badge>
      </div>
    </div>
  );
}
