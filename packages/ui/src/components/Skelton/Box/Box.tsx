export type LineProps = React.PropsWithChildren &
  React.HTMLAttributes<HTMLDivElement>;

export function Box(props: LineProps) {
  const { children, className = 'py-32' } = props;

  return (
    <div
      {...props}
      className={`relative flex justify-center align-middle bg-gray-300 rounded ${className}`}
    >
      {children && (
        <div className="flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {children}
        </div>
      )}
    </div>
  );
}
