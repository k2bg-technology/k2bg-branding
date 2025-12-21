'use client';

import * as RadixDialog from '@radix-ui/react-dialog';

import { Icon } from '../Icon';
import { Button } from '../Button';
import { twMerge } from '../../utils/extendTailwindMerge';

export interface Props
  extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Dialog({
  trigger,
  title,
  description,
  content,
  ...rest
}: Props) {
  return (
    <RadixDialog.Root {...rest}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed bg-black/50 inset-0" />
        <RadixDialog.Content className="flex flex-col gap-6 fixed top-[50%] left-[50%] w-max max-w-[calc(100%-2rem)] h-max max-h-[calc(100%-4rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl py-6 p-normal bg-white focus:outline-hidden md:p-6">
          <RadixDialog.Title
            className={twMerge(
              'text-body-r-sm leading-body-r-sm font-bold',
              !title && 'hidden'
            )}
          >
            {title}
          </RadixDialog.Title>
          {description && (
            <RadixDialog.Description className="text-body-r-sm leading-body-r-sm">
              {description}
            </RadixDialog.Description>
          )}
          {content}
          <RadixDialog.Close asChild>
            <Button
              type="button"
              className="absolute top-normal right-normal"
              aria-label="Close"
              color="dark"
              variant="ghost"
              size="icon"
            >
              <Icon name="x-mark" />
            </Button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
