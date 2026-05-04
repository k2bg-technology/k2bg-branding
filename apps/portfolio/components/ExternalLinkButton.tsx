import { buttonVariants, Icon } from 'ui';

type Props = React.ComponentPropsWithoutRef<'a'>;

export function ExternalLinkButton({ children, className, ...rest }: Props) {
  return (
    <a
      {...rest}
      target="_blank"
      rel="noreferrer"
      className={buttonVariants({
        color: 'light',
        variant: 'outline',
        className,
      })}
    >
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
  );
}
