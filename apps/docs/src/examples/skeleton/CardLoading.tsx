import { Card, Skeleton, Switch } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function CardLoading() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Switch label="Carregando" checked={loading} onCheckedChange={setLoading} />
      <Card aria-busy={loading}>
        {loading ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Skeleton variant="circle" />
            <Skeleton lines={2} />
          </div>
        ) : (
          <Card.Header title="Ana Lima" description="Designer de produto" />
        )}
      </Card>
    </div>
  );
}
