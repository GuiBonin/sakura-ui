import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renderiza usando a biblioteca pelo alias do código-fonte', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sakura UI 0.1.0');
  });
});
