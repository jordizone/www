import clsx from 'clsx';
import { Folder as FolderIcon, FolderOpen } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type FolderProps = {
  label: ReactNode;
  defaultOpen?: boolean;
  children?: ReactNode;
  className?: string;
};

export function Folder({ label, defaultOpen = false, children, className }: FolderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={clsx('w-full', className)} data-expanded={open}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group flex w-full items-center gap-1.5 rounded-sm px-1.5 py-1 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
      >
        <span className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center text-current/60 group-hover:text-current">
          <FolderIcon
            size={20}
            strokeWidth={1.5}
            className={clsx(
              'absolute origin-[25%_75%] transition-[opacity,transform] duration-200 ease-out',
              open ? 'rotate-[8deg] scale-90 opacity-0' : 'rotate-0 scale-100 opacity-100',
            )}
          />
          <FolderOpen
            size={20}
            strokeWidth={1.5}
            className={clsx(
              'absolute origin-[25%_75%] transition-[opacity,transform] duration-200 ease-out',
              open ? 'rotate-0 scale-100 opacity-100' : '-rotate-[8deg] scale-90 opacity-0',
            )}
          />
        </span>
        <span className="truncate">{label}</span>
      </button>

      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-px">{children}</div>
        </div>
      </div>
    </div>
  );
}
