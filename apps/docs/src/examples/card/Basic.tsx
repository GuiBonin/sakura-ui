import { Badge, Button, Card } from '@guibonin/sakura-ui';

export default function Basic() {
  return (
    <Card style={{ maxWidth: 360 }}>
      <Card.Header
        title="Plano Pro"
        description="Para quem publica toda semana."
        action={<Badge tone="primary">Popular</Badge>}
      />
      <Card.Body>Projetos ilimitados, domínio próprio e suporte prioritário.</Card.Body>
      <Card.Footer>
        <Button variant="ghost">Detalhes</Button>
        <Button>Assinar</Button>
      </Card.Footer>
    </Card>
  );
}
