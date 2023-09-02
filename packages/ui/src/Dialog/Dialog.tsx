'use client';

import * as RadixDialog from '@radix-ui/react-dialog';

import { SvgIcon } from '../Icon';

interface Props {
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
}: Props) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed bg-black/50 inset-0" />
        <RadixDialog.Content className="flex flex-col gap-5 fixed top-[50%] left-[50%] h-fit w-[70vw] translate-x-[-50%] translate-y-[-50%] rounded-xl p-12 bg-white focus:outline-none">
          {title && (
            <RadixDialog.Title className="text-body-sm leading-body-sm font-bold">
              {title}
            </RadixDialog.Title>
          )}
          {description && (
            <RadixDialog.Description className="text-body-sm leading-body-sm">
              {description}
            </RadixDialog.Description>
          )}
          <div className="h-full">{content}</div>
          <RadixDialog.Close asChild>
            <button
              type="button"
              className="absolute top-5 right-5 w-12 h-12"
              aria-label="Close"
            >
              <SvgIcon name="x-mark" />
            </button>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
