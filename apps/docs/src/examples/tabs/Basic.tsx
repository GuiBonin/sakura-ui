import { Tabs } from '@guibonin/sakura-ui';

export default function Basic() {
  return (
    <Tabs defaultValue="conta">
      <Tabs.List aria-label="Configurações">
        <Tabs.Tab value="conta">Conta</Tabs.Tab>
        <Tabs.Tab value="seguranca">Segurança</Tabs.Tab>
        <Tabs.Tab value="cobranca">Cobrança</Tabs.Tab>
        <Tabs.Tab value="api" disabled>
          API
        </Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="conta">Nome, foto e e-mail da sua conta.</Tabs.Panel>
      <Tabs.Panel value="seguranca">Senha e verificação em duas etapas.</Tabs.Panel>
      <Tabs.Panel value="cobranca">Plano atual e histórico de faturas.</Tabs.Panel>
      <Tabs.Panel value="api">Chaves de acesso.</Tabs.Panel>
    </Tabs>
  );
}
