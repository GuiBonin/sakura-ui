export type Side = 'top' | 'bottom' | 'left' | 'right';
export type Align = 'start' | 'center' | 'end';
export type Placement = Side | `${Side}-start` | `${Side}-end`;

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PositionOptions {
  placement: Placement;
  /** Distância entre gatilho e conteúdo, em px. */
  offset?: number;
  /** Margem mínima até a borda da janela, em px. */
  padding?: number;
}

export interface PositionResult {
  top: number;
  left: number;
  side: Side;
  align: Align;
}

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

export function parsePlacement(placement: Placement): [Side, Align] {
  const [side, align] = placement.split('-') as [Side, Align | undefined];
  return [side, align ?? 'center'];
}

function place(trigger: Rect, floating: Rect, side: Side, align: Align, offset: number) {
  let top = 0;
  let left = 0;
  if (side === 'top' || side === 'bottom') {
    top =
      side === 'top'
        ? trigger.top - floating.height - offset
        : trigger.top + trigger.height + offset;
    if (align === 'start') left = trigger.left;
    else if (align === 'end') left = trigger.left + trigger.width - floating.width;
    else left = trigger.left + trigger.width / 2 - floating.width / 2;
  } else {
    left =
      side === 'left'
        ? trigger.left - floating.width - offset
        : trigger.left + trigger.width + offset;
    if (align === 'start') top = trigger.top;
    else if (align === 'end') top = trigger.top + trigger.height - floating.height;
    else top = trigger.top + trigger.height / 2 - floating.height / 2;
  }
  return { top, left };
}

function fits(
  pos: { top: number; left: number },
  floating: Rect,
  side: Side,
  viewport: Rect,
  padding: number,
) {
  if (side === 'top') return pos.top >= padding;
  if (side === 'bottom') return pos.top + floating.height <= viewport.height - padding;
  if (side === 'left') return pos.left >= padding;
  return pos.left + floating.width <= viewport.width - padding;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Calcula a posição (coordenadas de viewport, para `position: fixed`).
 * Inverte o lado quando não cabe e desliza no eixo cruzado para não sair da tela.
 */
export function computePosition(
  trigger: Rect,
  floating: Rect,
  viewport: Rect,
  { placement, offset = 8, padding = 8 }: PositionOptions,
): PositionResult {
  const [preferredSide, align] = parsePlacement(placement);
  let side = preferredSide;
  let pos = place(trigger, floating, side, align, offset);

  if (!fits(pos, floating, side, viewport, padding)) {
    const flipped = opposite[side];
    const flippedPos = place(trigger, floating, flipped, align, offset);
    if (fits(flippedPos, floating, flipped, viewport, padding)) {
      side = flipped;
      pos = flippedPos;
    }
  }

  return {
    top: clamp(pos.top, padding, viewport.height - floating.height - padding),
    left: clamp(pos.left, padding, viewport.width - floating.width - padding),
    side,
    align,
  };
}
