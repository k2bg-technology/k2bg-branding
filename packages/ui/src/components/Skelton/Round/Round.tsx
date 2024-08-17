export type LineProps = React.PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>;

export function Round(props: LineProps) {
  const { children, className = 'w-12 h-12' } = props;

  return (
    <div
      {...props}
      className={`relative flex-none bg-gray-300 rounded-full ${className}`}
    >
      {children && (
        <div className="flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
