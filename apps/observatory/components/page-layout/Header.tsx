import type { ReactNode } from 'react';

interface Props {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function Header({ title, description, actions }: Props) {
  return (
    <header className="col-span-full flex flex-col gap-4 border-b border-base-default/15 pb-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex flex-col gap-condensed">
        <h1 className="text-heading-3">{title}</h1>
        {description && (
          <p className="text-body-r-sm text-base-black/80">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col gap-4 lg:items-end">{actions}</div>
      )}
    </header>
  );
}
