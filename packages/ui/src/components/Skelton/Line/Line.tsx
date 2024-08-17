export type LineProps = React.HTMLAttributes<HTMLDivElement>;

export function Line(props: LineProps) {
  const { className = 'py-1' } = props;

  return <div {...props} className={`bg-gray-200 rounded-5 ${className}`} />;
}
