import { Switch } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function Basic() {
  const [avisos, setAvisos] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Switch
        label="Notificações por e-mail"
        description={avisos ? 'Você vai receber os avisos.' : 'Avisos desligados.'}
        checked={avisos}
        onCheckedChange={setAvisos}
      />
      <Switch label="Modo compacto" size="sm" />
      <Switch label="Recurso beta" disabled />
    </div>
  );
}
