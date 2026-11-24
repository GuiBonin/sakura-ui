import './styles/index.css';

export const VERSION = '0.1.0';

// Tema
export { SakuraProvider, type SakuraProviderProps } from './theme/SakuraProvider';
export {
  ThemeProvider,
  useTheme,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemeMode,
  type ThemeProviderProps,
} from './theme/ThemeProvider';

// Hooks
export { useClickOutside } from './hooks/useClickOutside';
export {
  useControllableState,
  type UseControllableStateOptions,
} from './hooks/useControllableState';
export { useEscape } from './hooks/useEscape';
export { useFocusTrap, type UseFocusTrapOptions } from './hooks/useFocusTrap';
export { useMediaQuery, usePrefersReducedMotion } from './hooks/useMediaQuery';
export { useScrollLock } from './hooks/useScrollLock';

// Utilitários
export { cx, type ClassValue } from './utils/cx';
export { mergeRefs } from './utils/refs';
export { Portal, type PortalProps } from './utils/Portal';

// Componentes
export {
  Avatar,
  getInitials,
  type AvatarProps,
  type AvatarSize,
  type AvatarStatus,
} from './components/Avatar/Avatar';
export {
  Badge,
  type BadgeAppearance,
  type BadgeProps,
  type BadgeSize,
  type BadgeTone,
} from './components/Badge/Badge';
export {
  Button,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
} from './components/Button/Button';
export {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  type CardHeaderProps,
  type CardProps,
  type CardVariant,
} from './components/Card/Card';
export {
  ProgressBar,
  type ProgressBarProps,
  type ProgressTone,
} from './components/ProgressBar/ProgressBar';
export { Skeleton, type SkeletonProps, type SkeletonVariant } from './components/Skeleton/Skeleton';
export { Spinner, type SpinnerProps, type SpinnerSize } from './components/Spinner/Spinner';
