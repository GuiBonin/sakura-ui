import { Accordion } from '@guibonin/sakura-ui';

export default function Multiple() {
  return (
    <Accordion type="multiple" defaultValue={['entrega']} style={{ maxWidth: 560 }}>
      <Accordion.Item value="entrega" title="Entrega">
        De 3 a 7 dias úteis.
      </Accordion.Item>
      <Accordion.Item value="troca" title="Trocas">
        Até 30 dias depois do recebimento.
      </Accordion.Item>
      <Accordion.Item value="garantia" title="Garantia estendida" disabled>
        Disponível em breve.
      </Accordion.Item>
    </Accordion>
  );
}
