import { Button } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function Loading() {
  const [saving, setSaving] = useState(false);

  const save = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button loading={saving} loadingText="Salvando alterações" onClick={save}>
        Salvar
      </Button>
      <Button disabled>Desabilitado</Button>
    </div>
  );
}
