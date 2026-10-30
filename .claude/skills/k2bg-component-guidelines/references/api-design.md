# API Design

## Props and Forwarding

Name the main props interface `Props`. Extend `ComponentProps<'element'>` for native elements, or the wrapped Base UI primitive's props. Use `Omit` only for an intentional name conflict, and compose CVA's `VariantProps` when variants form the public API.

For example, a reusable card content part forwards native element props:

```tsx
import type { ComponentProps } from 'react';

import { cn } from '../../utils/cn';

interface Props extends ComponentProps<'div'> {}

export function Content({ className, ...rest }: Props) {
  return (
    <div data-slot="card-content" {...rest} className={cn('px-6', className)} />
  );
}

Content.displayName = 'Card.Content';
```

Accept refs as normal props under React 19; do not introduce `forwardRef`. Preserve the underlying element's ref type and forward it with the remaining props. A component does not receive a value it derives from another prop; derive it where the component makes the decision.

Use `cn()` from `packages/ui/src/utils/cn.ts` for class merging, with caller `className` last. Styling values and variant classes follow `k2bg-css-guidelines`; token selection belongs to `k2bg-figma-design`.

## Slots

Slot prop types admit only values the component renders. A slot that receives behavior, such as a trigger passed to Base UI's `render` prop, uses `ReactElement`. A display-only slot uses `ReactNode` and renders what it receives.

For example, an optional behavior slot is typed `trigger?: ReactElement`; a consumer supplies `trigger={isAdmin ? <Button /> : undefined}`.

## Variants

Use CVA for a component's variants. Name and export `xxxVariants` when another semantic element needs the appearance. For example, a `Button` exports `buttonVariants`, which an anchor applies directly to preserve link semantics. Do not use a button's element replacement to turn navigation into an action role.

Choose descriptive prop names and keep related variants in one CVA definition. Confirm every consumed design-system prop against that component's Storybook docs or stories, as required by `AGENTS.md`, "Storybook & Chromatic".
