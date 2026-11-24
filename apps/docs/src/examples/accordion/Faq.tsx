import { Accordion } from '@guibonin/sakura-ui';

export default function Faq() {
  return (
    <Accordion defaultValue="instalar" style={{ maxWidth: 560 }}>
      <Accordion.Item value="instalar" title="Como instalo a Sakura UI?">
        Rode npm install @guibonin/sakura-ui e importe o arquivo de estilos uma vez.
      </Accordion.Item>
      <Accordion.Item value="tema" title="Tem tema escuro?">
        Tem. O SakuraProvider segue o sistema por padrão e guarda a escolha da pessoa.
      </Accordion.Item>
      <Accordion.Item value="licenca" title="Posso usar em projeto comercial?">
        Pode. A licença é MIT.
      </Accordion.Item>
    </Accordion>
  );
}
