// Copia README.md e LICENSE da raiz para o pacote antes do `npm pack`/`npm publish`.
// O npm só inclui esses arquivos se estiverem na pasta do pacote.
import { copyFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const target = join(root, 'packages', 'sakura-ui');

for (const file of ['README.md', 'LICENSE']) {
  copyFileSync(join(root, file), join(target, file));
}
