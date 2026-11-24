import { Button } from '@guibonin/sakura-ui';
import { ArrowRight, Heart, Plus } from 'lucide-react';

export default function WithIcons() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button leftIcon={<Plus />}>Novo projeto</Button>
      <Button variant="outline" rightIcon={<ArrowRight />}>
        Continuar
      </Button>
      <Button variant="soft" iconOnly aria-label="Favoritar">
        <Heart />
      </Button>
    </div>
  );
}
