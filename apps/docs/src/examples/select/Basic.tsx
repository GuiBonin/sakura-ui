import { Select } from '@guibonin/sakura-ui';

const estados = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'mg', label: 'Minas Gerais' },
  { value: 'ba', label: 'Bahia', description: 'Nordeste' },
  { value: 'am', label: 'Amazonas', disabled: true },
];

export default function Basic() {
  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 360 }}>
      <Select label="Estado" options={estados} hint="Usamos para calcular o frete." />
    </div>
  );
}
