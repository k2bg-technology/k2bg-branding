import { render, screen } from '@testing-library/react';
import type React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type FieldProps = React.ComponentProps<typeof Form.Field>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

interface FieldOptions {
  fieldProps?: FieldProps;
  helperTextProps?: HelperTextProps;
}

function createField({
  fieldProps = {},
  helperTextProps = {},
}: FieldOptions = {}) {
  return (
    <Form.Field {...fieldProps}>
      <Form.Label htmlFor="email">{labelText}</Form.Label>
      <Form.Input id="email" />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Field>
  );
}

function getInput() {
  return screen.getByRole('textbox', { name: labelText });
}

function getHelperText() {
  return screen.getByText(helperTextContent);
}

describe('Form.HelperText', () => {
  it('renders the helper text content', () => {
    render(createField());

    expect(getHelperText()).toBeInTheDocument();
  });

  it('identifies itself with the id the control describes the input with', () => {
    render(createField({ fieldProps: { error: true } }));

    expect(getHelperText().id).not.toBe('');
    expect(getInput()).toHaveAttribute('aria-describedby', getHelperText().id);
  });

  it('uses the helper text id given to the control', () => {
    const customHelperTextId = 'custom-helper';

    render(
      createField({
        fieldProps: { error: true, helperTextId: customHelperTextId },
      })
    );

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', customHelperTextId);
  });

  it('agrees with the input about a custom id in server-rendered markup', () => {
    const customHelperTextId = 'custom-helper';

    const html = renderToString(
      createField({
        fieldProps: { error: true, helperTextId: customHelperTextId },
      })
    );

    expect(html).toContain(`aria-describedby="${customHelperTextId}"`);
    expect(html).toContain(`id="${customHelperTextId}"`);
  });

  it('keeps the control id when a helper text id is forced onto it', () => {
    const strayHelperTextId = 'stray-helper';
    // `helperTextId` is not part of the HelperText props; the cast mirrors a
    // consumer smuggling it through an untyped spread.
    const strayProps = { helperTextId: strayHelperTextId } as HelperTextProps;

    render(
      createField({
        fieldProps: { error: true },
        helperTextProps: strayProps,
      })
    );

    expect(getHelperText()).not.toHaveAttribute('id', strayHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', getHelperText().id);
  });

  it('rejects a helper text id at the type level', () => {
    // @ts-expect-error -- only Form.Field can keep both sides in sync.
    const element = <Form.HelperText helperTextId="custom-helper" />;

    expect(element).toBeDefined();
  });

  it('renders without an id outside a control', () => {
    render(<Form.HelperText>{helperTextContent}</Form.HelperText>);

    expect(getHelperText()).not.toHaveAttribute('id');
  });
});
