import { Card } from '@guibonin/sakura-ui';

export default function Variants() {
  return (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      }}
    >
      <Card variant="elevated">
        <Card.Header title="Elevated" description="Com sombra." />
      </Card>
      <Card variant="outlined">
        <Card.Header title="Outlined" description="Só a borda." />
      </Card>
      <Card variant="filled">
        <Card.Header title="Filled" description="Fundo preenchido." />
      </Card>
      <Card interactive>
        <Card.Header title="Interativo" description="Sobe no hover." />
      </Card>
    </div>
  );
}
