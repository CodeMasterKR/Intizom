import { cn } from '@/utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, { variant: BadgeVariant; label: string }> = {
    low: { variant: 'default', label: 'Past' },
    medium: { variant: 'info', label: 'O\'rta' },
    high: { variant: 'warning', label: 'Yuqori' },
    urgent: { variant: 'danger', label: 'Shoshilinch' },
  };
  const { variant, label } = map[priority] ?? map.low;
  return <Badge variant={variant}>{label}</Badge>;
}
