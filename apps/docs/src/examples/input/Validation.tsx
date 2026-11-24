import { Input } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function Validation() {
  const [password, setPassword] = useState('abc');
  const error = password && password.length < 8 ? 'Use pelo menos 8 caracteres.' : undefined;

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Input
        label="Senha"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        hint="Misture letras e números."
        error={error}
      />
    </div>
  );
}
