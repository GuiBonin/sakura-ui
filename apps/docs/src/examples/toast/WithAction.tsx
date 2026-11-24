import { Button, useToast } from '@guibonin/sakura-ui';

export default function WithAction() {
  const { toast } = useToast();

  const arquivar = () =>
    toast({
      title: 'Conversa arquivada',
      duration: 8000,
      action: {
        label: 'Desfazer',
        onClick: () => toast({ title: 'Conversa restaurada', tone: 'success' }),
      },
    });

  return <Button onClick={arquivar}>Arquivar conversa</Button>;
}
