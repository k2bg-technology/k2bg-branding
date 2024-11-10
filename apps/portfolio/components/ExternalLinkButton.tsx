import { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { Button, Icon } from 'ui';

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {}

export function ExternalLinkButton({
  children,
  ...rest
}: PropsWithChildren<Props>) {
  return (
    <Button color="light" variant="outline" asChild>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <a {...rest} target="_blank" rel="noreferrer">
        <span className="flex justify-center gap-condensed">
          <Icon
            name="arrow-top-right-on-square"
            color="var(--color-base-white)"
            width={14}
            height={14}
          />
          {children}
        </span>
      </a>
    </Button>
  );
}
