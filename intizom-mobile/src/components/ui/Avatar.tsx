import { cn } from '@/utils/cn';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function getColor(name: string) {
  const colors = ['#0a9090', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#087878', '#6366f1'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name = 'User', src, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizeMap[size], className)}
      />
    );
  }
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sizeMap[size], className)}
      style={{ backgroundColor: getColor(name) }}
    >
      {getInitials(name)}
    </div>
  );
}
