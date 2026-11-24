import { Button, Tooltip, useTheme } from '@guibonin/sakura-ui';
import { Moon, Sun } from 'lucide-react';

/** Alterna entre tema claro e escuro. */
export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const label = isDark ? 'Usar tema claro' : 'Usar tema escuro';
  return (
    <Tooltip content={label} placement="bottom">
      <Button variant="ghost" iconOnly aria-label={label} onClick={toggleTheme}>
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </Tooltip>
  );
}
