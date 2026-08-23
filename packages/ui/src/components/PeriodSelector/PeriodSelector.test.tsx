import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PeriodSelector } from '.';

function renderPeriodSelector(
  overrides: Partial<React.ComponentProps<typeof PeriodSelector>> = {}
) {
  const onPrevious = vi.fn();
  const onNext = vi.fn();

  render(
    <PeriodSelector
      label="August 2026"
      previousLabel="Previous month"
      nextLabel="Next month"
      onPrevious={onPrevious}
      onNext={onNext}
      {...overrides}
    />
  );

  return { onPrevious, onNext };
}

describe('PeriodSelector', () => {
  it('shows the current period label', () => {
    renderPeriodSelector();

    expect(screen.getByText('August 2026')).toBeInTheDocument();
  });

  it('names the stepping buttons with the given labels', () => {
    renderPeriodSelector();

    expect(
      screen.getByRole('button', { name: 'Previous month' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Next month' })
    ).toBeInTheDocument();
  });

  it('calls onPrevious when the previous button is clicked', async () => {
    const user = userEvent.setup();
    const { onPrevious } = renderPeriodSelector();

    await user.click(screen.getByRole('button', { name: 'Previous month' }));

    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it('calls onNext when the next button is clicked', async () => {
    const user = userEvent.setup();
    const { onNext } = renderPeriodSelector();

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it.each`
    prop                  | buttonName
    ${'previousDisabled'} | ${'Previous month'}
    ${'nextDisabled'}     | ${'Next month'}
  `('disables the $buttonName button with $prop', ({ prop, buttonName }) => {
    renderPeriodSelector({ [prop]: true });

    expect(screen.getByRole('button', { name: buttonName })).toBeDisabled();
  });

  it('does not call the handler of a disabled button', async () => {
    const user = userEvent.setup();
    const { onNext } = renderPeriodSelector({ nextDisabled: true });

    await user.click(screen.getByRole('button', { name: 'Next month' }));

    expect(onNext).not.toHaveBeenCalled();
  });

  it('announces label changes politely', () => {
    renderPeriodSelector();

    expect(screen.getByText('August 2026')).toHaveAttribute(
      'aria-live',
      'polite'
    );
  });
});
