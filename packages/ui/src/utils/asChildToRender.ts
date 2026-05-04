import * as React from 'react';

type AsChildProps<RenderProp = unknown> = {
  asChild?: boolean;
  render?: RenderProp;
  children?: React.ReactNode;
};

// Translates the legacy Radix `asChild` API into Base UI's `render` prop so
// that component public APIs stay stable while internals migrate. Tracked in
// issue #254. Removed once every consumer call site uses `render` directly.
export function asChildToRender<Props extends AsChildProps>(
  props: Props
): Omit<Props, 'asChild'> {
  const { asChild, render, children, ...rest } = props;

  if (!asChild || render !== undefined) {
    return { ...rest, render, children } as Omit<Props, 'asChild'>;
  }

  if (!React.isValidElement(children)) {
    return { ...rest, children } as Omit<Props, 'asChild'>;
  }

  const element = children as React.ReactElement<{
    children?: React.ReactNode;
  }>;

  // Forward the element as-is: Base UI's `mergeProps(props, render.props)` is
  // rightmost-wins, so stripping children here drops the label.
  // @see https://github.com/k2bg-technology/k2bg-branding/issues/265
  return {
    ...rest,
    render: element,
    children: element.props.children,
  } as Omit<Props, 'asChild'>;
}
