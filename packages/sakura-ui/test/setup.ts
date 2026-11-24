import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetMatchMedia } from './matchMedia';

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
