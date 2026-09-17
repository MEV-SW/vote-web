import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { DotPattern } from '@/components/ui/dot-pattern';

/** Fixed Motrex accent dot field — shared across hub / vote / edit / results. */
export function AppBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('app-backdrop', className)} aria-hidden>
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className={cn(
          'fill-[color-mix(in_srgb,var(--accent)_28%,transparent)]',
          '[mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent)]',
        )}
      />
    </div>
  );
}

/** Full-page shell with DotPattern background (login excluded). */
export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('app-shell', className)}>
      <AppBackdrop />
      <div className="app-shell-content">{children}</div>
    </div>
  );
}
