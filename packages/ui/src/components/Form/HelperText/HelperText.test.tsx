import { render, screen } from '@testing-library/react';
import type React from 'react';
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

  it('keeps an explicit id and lets the control point the input at it', () => {
    const customHelperTextId = 'custom-helper';

    render(
      buildControl({
        controlProps: { error: true },
        helperTextProps: { id: customHelperTextId },
      })
    );

    expect(getHelperText()).toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', customHelperTextId);
  });

  it('restores the generated id when the explicit id is removed', () => {
    const customHelperTextId = 'custom-helper';
    const { rerender } = render(
      buildControl({
        controlProps: { error: true },
        helperTextProps: { id: customHelperTextId },
      })
    );

    rerender(buildControl({ controlProps: { error: true } }));

    expect(getHelperText()).not.toHaveAttribute('id', customHelperTextId);
    expect(getInput()).toHaveAttribute('aria-describedby', getHelperText().id);
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
