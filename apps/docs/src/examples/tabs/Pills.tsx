import { Tabs } from '@guibonin/sakura-ui';

export default function Pills() {
  return (
    <Tabs defaultValue="mes" variant="pills" activation="manual">
      <Tabs.List aria-label="Período">
        <Tabs.Tab value="semana">Semana</Tabs.Tab>
        <Tabs.Tab value="mes">Mês</Tabs.Tab>
        <Tabs.Tab value="ano">Ano</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="semana">128 visitas nos últimos 7 dias.</Tabs.Panel>
      <Tabs.Panel value="mes">2.340 visitas nos últimos 30 dias.</Tabs.Panel>
      <Tabs.Panel value="ano">31.902 visitas em 12 meses.</Tabs.Panel>
    </Tabs>
  );
}
