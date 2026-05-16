'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import type { ReactElement } from 'react';
import { twMerge } from '../../utils/extendTailwindMerge';
import { Button } from '../Button';
import { Icon } from '../Icon';

export interface Props extends DialogPrimitive.Root.Props {
  trigger: React.ReactNode;
  content: React.ReactNode;
  title: string;
  isTitleHidden?: boolean;
  description?: string;
}

export function Dialog({
  trigger,
  title,
  isTitleHidden = false,
  description,
  content,
  ...rest
}: Props) {
  return (
    <DialogPrimitive.Root {...rest}>
      <DialogPrimitive.Trigger render={trigger as ReactElement} />
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed bg-black/50 inset-0" />
        <DialogPrimitive.Popup className="flex flex-col gap-6 fixed top-[50%] left-[50%] w-max max-w-[calc(100%-2rem)] h-max max-h-[calc(100%-4rem)] translate-x-[-50%] translate-y-[-50%] rounded-xl p-normal bg-white focus:outline-hidden md:p-6">
          <DialogPrimitive.Title
            className={twMerge(
              'text-body-r-sm leading-body-r-sm font-bold',
              isTitleHidden && 'sr-only'
            )}
          >
            {title}
          </DialogPrimitive.Title>
          {description && (
            <DialogPrimitive.Description className="text-body-r-sm leading-body-r-sm">
              {description}
            </DialogPrimitive.Description>
          )}
          {content}
          <DialogPrimitive.Close
            render={
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
            }
          />
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
