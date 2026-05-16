'use client';

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';
import { isValidElement } from 'react';
import { twMerge } from '../../utils/extendTailwindMerge';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { ScrollArea } from '../ScrollArea';

import styles from './Drawer.module.css';

export interface Props extends React.ComponentPropsWithoutRef<'div'> {
  trigger: React.ReactNode;
  mainContent: React.ReactNode;
  title?: string;
  description?: string;
}

export function Drawer({
  trigger,
  title,
  description,
  mainContent,
  className,
  ...rest
}: Props) {
  return (
    <DrawerPrimitive.Root swipeDirection="right">
      {isValidElement(trigger) && <DrawerPrimitive.Trigger render={trigger} />}
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Backdrop className="fixed bg-black/50 inset-0" />
        <DrawerPrimitive.Viewport>
          <DrawerPrimitive.Popup
            {...rest}
            className={twMerge(
              'grid auto-rows-max gap-5 fixed top-0 right-0 w-max h-full rounded-xl bg-white drop-shadow-xl',
              styles.popup,
              className
            )}
          >
            <ScrollArea className="p-6 pt-14 max-h-dvh">
              <DrawerPrimitive.Content className="flex flex-col gap-y-spacious">
                <DrawerPrimitive.Title
                  className={twMerge(
                    'text-body-r-sm leading-body-r-sm font-bold',
                    !title && 'hidden'
                  )}
                >
                  {title}
                </DrawerPrimitive.Title>
                {description && (
                  <DrawerPrimitive.Description className="text-body-r-sm leading-body-r-sm">
                    {description}
                  </DrawerPrimitive.Description>
                )}
                {mainContent}
              </DrawerPrimitive.Content>
            </ScrollArea>
            <DrawerPrimitive.Close
              render={
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
              }
            />
          </DrawerPrimitive.Popup>
        </DrawerPrimitive.Viewport>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
