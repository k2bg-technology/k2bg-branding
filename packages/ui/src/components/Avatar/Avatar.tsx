import { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  image: ReactNode;
  name?: string;
}

export default function Avatar({ className, image, name, ...rest }: Props) {
  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...rest} className={`inline-flex gap-6 items-center ${className}`}>
      {image && (
        <div className="flex flex-none items-center overflow-hidden rounded-full w-12 h-12">
          {image}
        </div>
      )}
      {name && <span className="text-body-r-sm font-bold">{name}</span>}
    </div>
  );
}
