import { computePosition, parsePlacement } from './position';

const viewport = { top: 0, left: 0, width: 1000, height: 800 };
const floating = { top: 0, left: 0, width: 100, height: 40 };
const trigger = { top: 400, left: 450, width: 100, height: 30 };

describe('parsePlacement', () => {
  it.each([
    ['top', ['top', 'center']],
    ['bottom-start', ['bottom', 'start']],
    ['left-end', ['left', 'end']],
  ] as const)('%s', (placement, expected) => {
    expect(parsePlacement(placement)).toEqual(expected);
  });
});

describe('computePosition', () => {
  it('posiciona em cima, centralizado', () => {
    expect(computePosition(trigger, floating, viewport, { placement: 'top' })).toEqual({
      top: 400 - 40 - 8,
      left: 450,
      side: 'top',
      align: 'center',
    });
  });

  it('posiciona embaixo alinhado ao início e ao fim', () => {
    expect(
      computePosition(trigger, floating, viewport, { placement: 'bottom-start' }),
    ).toMatchObject({ top: 438, left: 450, side: 'bottom' });
    const wide = { ...floating, width: 200 };
    expect(computePosition(trigger, wide, viewport, { placement: 'bottom-end' })).toMatchObject({
      left: 350,
    });
  });

  it('posiciona à esquerda e à direita', () => {
    expect(computePosition(trigger, floating, viewport, { placement: 'left' })).toMatchObject({
      left: 450 - 100 - 8,
      top: 395,
      side: 'left',
    });
    expect(
      computePosition(trigger, floating, viewport, { placement: 'right-start', offset: 4 }),
    ).toMatchObject({ left: 554, top: 400, side: 'right' });
    expect(computePosition(trigger, floating, viewport, { placement: 'right-end' })).toMatchObject({
      top: 390,
    });
  });

  it('inverte para baixo quando não cabe em cima', () => {
    const nearTop = { ...trigger, top: 10 };
    expect(computePosition(nearTop, floating, viewport, { placement: 'top' })).toMatchObject({
      side: 'bottom',
      top: 48,
    });
  });

  it('inverte para a esquerda quando não cabe à direita', () => {
    const nearRight = { ...trigger, left: 950, width: 40 };
    expect(computePosition(nearRight, floating, viewport, { placement: 'right' })).toMatchObject({
      side: 'left',
    });
  });

  it('mantém o lado preferido quando nenhum dos dois cabe', () => {
    const tiny = { ...viewport, height: 60 };
    const result = computePosition({ ...trigger, top: 10 }, floating, tiny, { placement: 'top' });
    expect(result.side).toBe('top');
  });

  it('desliza para dentro da tela no eixo cruzado', () => {
    const nearLeft = { ...trigger, left: 0, width: 20 };
    expect(computePosition(nearLeft, floating, viewport, { placement: 'top' })).toMatchObject({
      left: 8,
    });
    const nearRight = { ...trigger, left: 990, width: 10 };
    expect(computePosition(nearRight, floating, viewport, { placement: 'bottom' })).toMatchObject({
      left: 1000 - 100 - 8,
    });
  });
});
