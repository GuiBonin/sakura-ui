import { VERSION } from './index';
import pkg from '../package.json';

describe('pacote', () => {
  it('exporta a mesma versão do package.json', () => {
    expect(VERSION).toBe(pkg.version);
  });
});
