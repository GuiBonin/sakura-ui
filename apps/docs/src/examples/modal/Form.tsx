import { Button, Input, Modal, Select } from '@guibonin/sakura-ui';
import { useState } from 'react';

const papeis = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'leitor', label: 'Leitor' },
];

export default function Form() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Convidar pessoa</Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Convidar para o time"
        footer={<Button onClick={() => setOpen(false)}>Enviar convite</Button>}
      >
        <div style={{ display: 'grid', gap: 16 }}>
          <Input label="E-mail" type="email" placeholder="pessoa@exemplo.com" />
          <Select label="Papel" options={papeis} defaultValue="editor" />
        </div>
      </Modal>
    </>
  );
}
