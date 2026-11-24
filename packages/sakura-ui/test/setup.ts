import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { MotionGlobalConfig } from 'framer-motion';
import { afterEach } from 'vitest';
import { resetMatchMedia } from './matchMedia';

// Animações instantâneas nos testes: o jsdom não pinta e as saídas ficariam pendentes.
MotionGlobalConfig.skipAnimations = true;

afterEach(() => {
  cleanup();
  resetMatchMedia();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.style.colorScheme = '';
  try {
    window.localStorage.clear();
  } catch {
    // ambiente sem storage
  }
});
