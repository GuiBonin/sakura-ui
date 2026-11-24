import { Button, Input, Modal, useToast } from '@guibonin/sakura-ui';
import { useState } from 'react';

export default function Confirm() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const excluir = () => {
    setOpen(false);
    toast({ title: 'Projeto excluído', tone: 'success' });
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        Excluir projeto
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir projeto?"
        description="Essa ação não pode ser desfeita. Os arquivos serão apagados."
        role="alertdialog"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={excluir}>
              Excluir
            </Button>
          </>
        }
      >
        <Input label="Digite o nome do projeto para confirmar" placeholder="sakura-ui" />
      </Modal>
    </>
  );
}
