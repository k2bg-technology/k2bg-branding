import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type ControlProps = React.ComponentProps<typeof Form.Control>;
type LabelProps = React.ComponentProps<typeof Form.Label>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

interface ControlOptions {
  controlProps?: ControlProps;
  labelProps?: LabelProps;
}

function renderInControl({
  controlProps = {},
  labelProps = {},
}: ControlOptions = {}) {
  return render(
    <Form.Control {...controlProps}>
      <Form.Label htmlFor="email" {...labelProps}>
        {labelText}
      </Form.Label>
      <Form.Input id="email" />
      <Form.HelperText>{helperTextContent}</Form.HelperText>
    </Form.Control>
  );
}

function getLabel() {
  return screen.getByText(labelText);
}

type FormStateProps = Pick<LabelProps, 'error' | 'disabled'>;

const stateClassCases: ReadonlyArray<{
  state: string;
  formStateProps: FormStateProps;
  expectedClass: string;
}> = [
  {
    state: 'error',
    formStateProps: { error: true },
    expectedClass: 'text-error',
  },
  {
    state: 'disabled',
    formStateProps: { disabled: true },
    expectedClass: 'text-neutral-300',
  },
];

describe('Form.Label', () => {
  it('names the associated control', () => {
    renderInControl();

    expect(screen.getByLabelText(labelText)).toBe(
      screen.getByRole('textbox', { name: labelText })
    );
  });

  it.each(['helpertextid', 'required'])(
    'keeps the form context value "%s" off the label element',
    (leakedAttribute) => {
      renderInControl({ controlProps: { required: true } });

      expect(getLabel()).not.toHaveAttribute(leakedAttribute);
    }
  );

  it.each(stateClassCases)(
    'styles the label with $expectedClass when $state',
    ({ formStateProps, expectedClass }) => {
      renderInControl({ labelProps: formStateProps });

      expect(getLabel()).toHaveClass(expectedClass);
    }
  );

  it.each(stateClassCases)(
    'styles the label with $expectedClass when the control is $state',
    ({ formStateProps, expectedClass }) => {
      renderInControl({ controlProps: formStateProps });

      expect(getLabel()).toHaveClass(expectedClass);
    }
  );

  it('renders the label text outside a control', () => {
    render(<Form.Label>{labelText}</Form.Label>);

    expect(getLabel()).toBeInTheDocument();
  });
});
