interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  subContent?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  action,
  subContent,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="space-y-1.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {description}
            </p>
          )}
        </div>
        {subContent}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
