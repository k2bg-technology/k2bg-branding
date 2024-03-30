import { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  category?: ReactNode;
  heading?: ReactNode;
  excerpt?: string;
  avatar?: ReactNode;
  date?: string;
}

export default function Content({
  className,
  category,
  heading,
  excerpt,
  avatar,
  date,
  ...rest
}: Props) {
  return (
    <div {...rest} className={`flex flex-col gap-4 ${className}`}>
      {category && (
        <p className="text-body-r-sm text-accent-default font-bold capitalize">
          {category}
        </p>
      )}
      {heading}
      {excerpt && (
        <p className="break-all text-body-r-sm leading-body-r-sm text-base-black/80 text-justify whitespace-pre-wrap line-clamp-5 text-ellipsis">
          {excerpt}
        </p>
      )}

      <div className="inline-flex gap-6 items-center">
        {avatar}
        {date && <span className="text-body-r-sm">{date}</span>}
      </div>
    </div>
  );
}
