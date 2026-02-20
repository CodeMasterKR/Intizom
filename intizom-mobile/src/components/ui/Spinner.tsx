import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'rounded-full border-brand-500 border-t-transparent animate-spin',
        sizeMap[size],
        className,
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-950 z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-bold text-brand-500">Intizom</div>
        <Spinner size="lg" />
      </div>
    </div>
  );
}
