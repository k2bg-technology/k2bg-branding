import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';

import { Form } from '..';

type FieldProps = React.ComponentProps<typeof Form.Field>;
type LabelProps = React.ComponentProps<typeof Form.Label>;

const labelText = 'Email';
const helperTextContent = 'Enter a valid email address';

interface FieldOptions {
  fieldProps?: FieldProps;
  labelProps?: LabelProps;
}

function renderInField({
  fieldProps = {},
  labelProps = {},
}: FieldOptions = {}) {
  return render(
    <Form.Field {...fieldProps}>
      <Form.Label htmlFor="email" {...labelProps}>
        {labelText}
      </Form.Label>
      <Form.Input id="email" />
      <Form.HelperText>{helperTextContent}</Form.HelperText>
    </Form.Field>
  );
}

function getLabel() {
  return screen.getByText(labelText);
}

describe('Form.Label', () => {
  it('names the associated control', () => {
    renderInField();

    expect(screen.getByLabelText(labelText)).toBe(
      screen.getByRole('textbox', { name: labelText })
    );
  });

  it.each(['helpertextid', 'required'])(
    'keeps the form context value "%s" off the label element',
    (leakedAttribute) => {
      renderInField({ fieldProps: { required: true } });

      expect(getLabel()).not.toHaveAttribute(leakedAttribute);
    }
  );

  it('renders the label text outside a control', () => {
    render(<Form.Label>{labelText}</Form.Label>);

    expect(getLabel()).toBeInTheDocument();
  });
});
