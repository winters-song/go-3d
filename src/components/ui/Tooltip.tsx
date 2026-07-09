import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export default function Tooltip({ label, children }: TooltipProps) {
  return (
    <div className="group relative flex items-center justify-center">
      {children}
      <span
        role="tooltip"
        className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2.5 py-1.5 text-xs font-medium text-white bg-black/75 backdrop-blur-sm rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none z-50"
      >
        {label}
      </span>
    </div>
  );
}
