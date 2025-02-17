'use client';

import { HTMLAttributes } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

import { Icon } from '../Icon';
import { Button } from '../Button';
import { twMerge } from '../../utils/extendTailwindMerge';
import { ScrollArea } from '../ScrollArea';

import styles from './Drawer.module.css';

interface Props extends HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode;
  mainContent: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Drawer({
  trigger,
  title,
  description,
  mainContent,
  className,
  ...rest
}: Props) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed bg-black/50 inset-0" />
        <RadixDialog.Content
          {...rest}
          className={twMerge(
            'grid auto-rows-max gap-5 fixed top-0 right-0 w-max h-full rounded-xl bg-white drop-shadow-xl',
            styles.Content,
            className
          )}
        >
          <ScrollArea className="p-6 pt-14 max-h-dvh">
            {title && (
              <RadixDialog.Title className="text-body-r-sm leading-body-r-sm font-bold">
                {title}
              </RadixDialog.Title>
            )}
            {description && (
              <RadixDialog.Description className="text-body-r-sm leading-body-r-sm">
                {description}
              </RadixDialog.Description>
            )}
            {mainContent}
          </ScrollArea>
          <RadixDialog.Close asChild>
            <Button
              type="button"
              className="absolute top-2 left-6"
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
