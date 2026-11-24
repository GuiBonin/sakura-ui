import { Button, Dropdown, useToast } from '@guibonin/sakura-ui';
import { ChevronDown, Copy, Pencil, Trash2 } from 'lucide-react';

export default function Actions() {
  const { toast } = useToast();

  return (
    <Dropdown
      trigger={
        <Button variant="outline" rightIcon={<ChevronDown />}>
          Ações
        </Button>
      }
      items={[
        { type: 'label', label: 'Arquivo' },
        {
          label: 'Renomear',
          icon: <Pencil />,
          shortcut: 'F2',
          onSelect: () => toast({ title: 'Renomear' }),
        },
        {
          label: 'Duplicar',
          icon: <Copy />,
          shortcut: 'Ctrl+D',
          onSelect: () => toast({ title: 'Arquivo duplicado' }),
        },
        { label: 'Mover (em breve)', disabled: true },
        { type: 'separator' },
        {
          label: 'Excluir',
          icon: <Trash2 />,
          danger: true,
          onSelect: () => toast({ title: 'Arquivo excluído', tone: 'danger' }),
        },
      ]}
    />
  );
}
