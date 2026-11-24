import { Button, Tooltip } from '@guibonin/sakura-ui';
import { Copy, Share2, Trash2 } from 'lucide-react';

export default function Basic() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Tooltip content="Copiar link">
        <Button variant="outline" iconOnly aria-label="Copiar link">
          <Copy />
        </Button>
      </Tooltip>
      <Tooltip content="Compartilhar" placement="bottom">
        <Button variant="outline" iconOnly aria-label="Compartilhar">
          <Share2 />
        </Button>
      </Tooltip>
      <Tooltip content="Mover para a lixeira" placement="right">
        <Button variant="outline" iconOnly aria-label="Excluir">
          <Trash2 />
        </Button>
      </Tooltip>
    </div>
  );
}
