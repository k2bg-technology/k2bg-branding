import { render, screen } from '@testing-library/react';
import type React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type ControlProps = React.ComponentProps<typeof Form.Control>;
type HelperTextProps = React.ComponentProps<typeof Form.HelperText>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

interface ControlOptions {
  controlProps?: ControlProps;
  helperTextProps?: HelperTextProps;
}

function buildControl({
  controlProps = {},
  helperTextProps = {},
}: ControlOptions = {}) {
  return (
    <Form.Control {...controlProps}>
      <Form.Label htmlFor="email">{labelText}</Form.Label>
      <Form.Input id="email" />
      <Form.HelperText {...helperTextProps}>
        {helperTextContent}
      </Form.HelperText>
    </Form.Control>
  );
}

function getInput() {
  return screen.getByRole('textbox', { name: labelText });
}

function getHelperText() {
  return screen.getByText(helperTextContent);
}

const stateClassCases: ReadonlyArray<{
  state: string;
  helperTextProps: HelperTextProps;
  expectedClass: string;
}> = [
  {
    state: 'error',
    helperTextProps: { error: true },
    expectedClass: 'text-error',
  },
  {
    state: 'disabled',
    helperTextProps: { disabled: true },
    expectedClass: 'text-neutral-300',
  },
];

describe('Form.HelperText', () => {
  it('renders the helper text content', () => {
    render(buildControl());

    expect(getHelperText()).toBeInTheDocument();
  });

  it('identifies itself with the id the control describes the input with', () => {
    render(buildControl({ controlProps: { error: true } }));

    expect(getHelperText().id).not.toBe('');
    expect(getInput()).toHaveAttribute('aria-describedby', getHelperText().id);
  });

  it('uses the helper text id given to the control', () => {
    const customHelperTextId = 'custom-helper';

    render(
      buildControl({
        controlProps: { error: true, helperTextId: customHelperTextId },
      })
    );

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', customHelperTextId);
  });

  it('agrees with the input about a custom id in server-rendered markup', () => {
    const customHelperTextId = 'custom-helper';

    const html = renderToString(
      buildControl({
        controlProps: { error: true, helperTextId: customHelperTextId },
      })
    );

    expect(html).toContain(`aria-describedby="${customHelperTextId}"`);
    expect(html).toContain(`id="${customHelperTextId}"`);
  });

  it.each(stateClassCases)(
    'styles the helper text with $expectedClass when $state',
    ({ helperTextProps, expectedClass }) => {
      render(buildControl({ helperTextProps }));

      expect(getHelperText()).toHaveClass(expectedClass);
    }
  );

  it('renders without an id outside a control', () => {
    render(<Form.HelperText>{helperTextContent}</Form.HelperText>);

    expect(getHelperText()).not.toHaveAttribute('id');
  });
});
