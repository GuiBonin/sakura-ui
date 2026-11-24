import { ProgressBar } from '@guibonin/sakura-ui';

export default function Indeterminate() {
  return (
    <div style={{ maxWidth: 420 }}>
      <ProgressBar label="Sincronizando" />
    </div>
  );
}
