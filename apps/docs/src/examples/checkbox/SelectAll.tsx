import { Checkbox } from '@guibonin/sakura-ui';
import { useState } from 'react';

const itens = ['Componentes', 'Documentação', 'Testes'];

export default function SelectAll() {
  const [marcados, setMarcados] = useState<string[]>(['Componentes']);
  const todos = marcados.length === itens.length;
  const alguns = marcados.length > 0 && !todos;

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 360 }}>
      <Checkbox
        label="Selecionar tudo"
        checked={todos}
        indeterminate={alguns}
        onCheckedChange={(checked) => setMarcados(checked ? itens : [])}
      />
      <div style={{ display: 'grid', gap: 8, paddingLeft: 28 }}>
        {itens.map((item) => (
          <Checkbox
            key={item}
            label={item}
            checked={marcados.includes(item)}
            onCheckedChange={(checked) =>
              setMarcados((atual) =>
                checked ? [...atual, item] : atual.filter((valor) => valor !== item),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
