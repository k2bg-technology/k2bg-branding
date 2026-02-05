import { Toaster as Sonner } from 'sonner';

import { Icon } from '../Icon';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      {...props}
      position="top-center"
      className="toaster group !font-original !text-button-r-sm"
      toastOptions={{
        classNames: {
          toast: 'group toast !backdrop-blur-sm !bg-white/10',
        },
      }}
      icons={{
        success: (
          <Icon
            name="check-circle"
            appearance="solid"
            width={20}
            height={20}
            color="var(--color-success)"
          />
        ),
        info: (
          <Icon
            name="information-circle"
            appearance="solid"
            width={20}
            height={20}
            color="var(--color-info)"
          />
        ),
        warning: (
          <Icon
            name="exclamation-triangle"
            appearance="solid"
            width={20}
            height={20}
            color="var(--color-warning)"
          />
        ),
        error: (
          <Icon
            name="x-circle"
            appearance="solid"
            width={20}
            height={20}
            color="var(--color-error)"
          />
        ),
      }}
    />
  );
}
