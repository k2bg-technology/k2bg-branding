import { twMerge } from 'tailwind-merge';

interface Props extends React.ComponentPropsWithoutRef<'div'> {
  category?: React.ReactNode;
  heading?: React.ReactNode;
  excerpt?: string;
  avatar?: React.ReactNode;
  date?: string;
}

export function Content({
  className,
  category,
  heading,
  excerpt,
  avatar,
  date,
  ...rest
}: Props) {
  return (
    <div {...rest} className={twMerge('flex flex-col gap-normal', className)}>
      {category && (
        <p className="text-body-r-sm font-bold capitalize bg-gradient-to-r from-main-default to-main-dark inline-block text-transparent bg-clip-text">
          {category}
        </p>
      )}
      {heading}
      {excerpt && (
        <p className="break-all text-body-r-sm leading-body-r-sm text-base-black text-justify whitespace-pre-wrap line-clamp-5 text-ellipsis">
          {excerpt}
        </p>
      )}

      <div className="inline-flex gap-normal items-center">
        {avatar}
        {date && <span className="text-body-r-sm">{date}</span>}
      </div>
    </div>
  );
}
