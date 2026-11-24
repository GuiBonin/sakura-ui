type Listener = (event: MediaQueryListEvent) => void;

interface FakeQuery {
  matches: boolean;
  listeners: Set<Listener>;
}

const queries = new Map<string, FakeQuery>();
let overrides: Record<string, boolean> = {};

function getQuery(media: string): FakeQuery {
  let query = queries.get(media);
  if (!query) {
    query = { matches: overrides[media] ?? false, listeners: new Set() };
    queries.set(media, query);
  }
  return query;
}

function install() {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (media: string): MediaQueryList => {
      const query = getQuery(media);
      return {
        get matches() {
          return query.matches;
        },
        media,
        onchange: null,
        addEventListener: (_: string, listener: Listener) => query.listeners.add(listener),
        removeEventListener: (_: string, listener: Listener) => query.listeners.delete(listener),
        addListener: (listener: Listener) => query.listeners.add(listener),
        removeListener: (listener: Listener) => query.listeners.delete(listener),
        dispatchEvent: () => true,
      } as unknown as MediaQueryList;
    },
  });
}

install();

/** Define o resultado de uma media query e avisa quem está ouvindo. */
export function setMediaQuery(media: string, matches: boolean) {
  overrides[media] = matches;
  const query = getQuery(media);
  query.matches = matches;
  query.listeners.forEach((listener) => listener({ matches, media } as MediaQueryListEvent));
}

export const PREFERS_DARK = '(prefers-color-scheme: dark)';
export const PREFERS_REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export function resetMatchMedia() {
  overrides = {};
  queries.clear();
  install();
}
