'use client';

import { HTMLAttributes } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';

import { Icon } from '../Icon';
import { Button } from '../Button';
import { twMerge } from '../../utils/extendTailwindMerge';

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
            'grid auto-rows-max gap-5 fixed top-0 right-0 w-max h-full rounded-xl p-6 bg-white drop-shadow-xl overflow-y-auto',
            styles.Content,
            className
          )}
        >
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
          <div className="h-full">{mainContent}</div>
          <RadixDialog.Close asChild>
            <Button
              type="button"
              className="absolute top-5 right-5"
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
