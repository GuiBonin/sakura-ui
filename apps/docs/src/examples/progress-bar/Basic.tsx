import { Button, ProgressBar } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function Basic() {
  const [enviados, setEnviados] = useState(3);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
      <ProgressBar
        label="Enviando arquivos"
        value={enviados}
        max={10}
        showValue
        valueText={`${enviados} de 10 arquivos`}
      />
      <ProgressBar aria-label="Armazenamento usado" value={92} tone="danger" size="sm" />
      <div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEnviados((atual) => (atual >= 10 ? 0 : atual + 1))}
        >
          Avançar
        </Button>
      </div>
    </div>
  );
}
