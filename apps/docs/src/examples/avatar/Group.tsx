import { Avatar } from '@guibonin/sakura-ui';

export default function Group() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
      <Avatar name="Ana Lima" size="xs" />
      <Avatar name="Bruno Costa" size="sm" status="online" />
      <Avatar name="Carla Souza" status="busy" />
      <Avatar name="Diego Alves" size="lg" status="away" />
      <Avatar name="Eva Rocha" size="xl" shape="square" />
    </div>
  );
}
