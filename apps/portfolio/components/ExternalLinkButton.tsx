import { Button, Icon } from 'ui';

type Props = React.ComponentPropsWithoutRef<'a'>;

export function ExternalLinkButton({ children, ...rest }: Props) {
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
