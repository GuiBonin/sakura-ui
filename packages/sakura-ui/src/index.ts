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
export { Checkbox, type CheckboxProps } from './components/Checkbox/Checkbox';
export { Input, type InputProps, type InputSize } from './components/Input/Input';
export { Select, type SelectOption, type SelectProps } from './components/Select/Select';
export { Switch, type SwitchProps } from './components/Switch/Switch';
export {
  Accordion,
  AccordionItem,
  type AccordionItemProps,
  type AccordionMultipleProps,
  type AccordionProps,
  type AccordionSingleProps,
} from './components/Accordion/Accordion';
export {
  Dropdown,
  type DropdownActionItem,
  type DropdownItem,
  type DropdownLabel,
  type DropdownProps,
  type DropdownSeparator,
} from './components/Dropdown/Dropdown';
export { Modal, type ModalProps, type ModalSize } from './components/Modal/Modal';
export {
  Tab,
  TabPanel,
  Tabs,
  TabsList,
  type TabPanelProps,
  type TabProps,
  type TabsProps,
} from './components/Tabs/Tabs';
export {
  ToastProvider,
  useToast,
  type ToastContextValue,
  type ToastOptions,
  type ToastPosition,
  type ToastProviderProps,
  type ToastTone,
} from './components/Toast/Toast';
export { Tooltip, type TooltipProps } from './components/Tooltip/Tooltip';
export { useFloatingPosition } from './hooks/useFloatingPosition';
export {
  computePosition,
  type Align,
  type Placement,
  type PositionResult,
  type Side,
} from './utils/position';
