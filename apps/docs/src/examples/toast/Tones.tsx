import { Button, useToast } from '@guibonin/sakura-ui';

export default function Tones() {
  const { toast } = useToast();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Button variant="outline" onClick={() => toast({ title: 'Nova versão disponível' })}>
        Info
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: 'Pagamento aprovado', description: 'R$ 99,00', tone: 'success' })
        }
      >
        Sucesso
      </Button>
      <Button
        variant="outline"
        onClick={() => toast({ title: 'Seu plano vence amanhã', tone: 'warning' })}
      >
        Aviso
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast({ title: 'Falha ao salvar', description: 'Tente de novo.', tone: 'danger' })
        }
      >
        Erro
      </Button>
    </div>
  );
}
