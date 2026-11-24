import { User } from 'lucide-react';
import { forwardRef, useState, type HTMLAttributes } from 'react';
import { cx } from '../../utils/cx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  src?: string;
  /** Nome da pessoa. Gera as iniciais do fallback e o texto alternativo. */
  name?: string;
  /** Texto alternativo da imagem. Padrão: `name`. */
  alt?: string;
  size?: AvatarSize;
  shape?: 'circle' | 'square';
  status?: AvatarStatus;
}

const statusLabel: Record<AvatarStatus, string> = {
  online: 'online',
  offline: 'offline',
  busy: 'ocupado',
  away: 'ausente',
};

/** Pega a primeira letra do primeiro e do último nome. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return (first + last).toUpperCase();
}

/** Foto de perfil com fallback para iniciais ou ícone quando a imagem falha. */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, name, alt, size = 'md', shape = 'circle', status, className, ...props },
  ref,
) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;
  const label = alt ?? name;
  const initials = name ? getInitials(name) : '';
  const accessibleName = [label, status && statusLabel[status]].filter(Boolean).join(', ');

  return (
    <span
      ref={ref}
      className={cx('sk-avatar', className)}
      data-size={size}
      data-shape={shape}
      role="img"
      aria-label={accessibleName || 'Avatar'}
      {...props}
    >
      {showImage ? (
        <img
          className="sk-avatar__image"
          src={src}
          alt=""
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : initials ? (
        <span className="sk-avatar__initials" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <User className="sk-avatar__icon" aria-hidden="true" />
      )}
      {status && <span className="sk-avatar__status" data-status={status} aria-hidden="true" />}
    </span>
  );
});
