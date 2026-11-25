import { Spinner } from '@guibonin/sakura-ui';

export default function Tones() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
      <Spinner />
      <Spinner tone="accent" />
      <Spinner tone="info" />
      <Spinner tone="success" />
      <Spinner tone="warning" />
      <Spinner tone="danger" />
      <Spinner tone="neutral" />
    </div>
  );
}
