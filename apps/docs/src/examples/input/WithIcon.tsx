import { Input } from '@guibonin/sakura-ui';
import { Mail, Search } from 'lucide-react';

export default function WithIcon() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Input aria-label="Buscar" placeholder="Buscar componentes" leftIcon={<Search />} />
      <Input label="E-mail" type="email" placeholder="voce@exemplo.com" rightIcon={<Mail />} />
    </div>
  );
}
