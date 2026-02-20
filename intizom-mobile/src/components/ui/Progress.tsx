import { cn } from '@/utils/cn';

interface ProgressProps {
  value: number; // 0-100
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeMap = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

export function Progress({ value, color = '#0a9090', size = 'md', showLabel, className }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', sizeMap[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 min-w-[32px] text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
