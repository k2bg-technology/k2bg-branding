import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ImageViewer } from './ImageViewer';

const imageUrl = 'https://example.com/hero.jpg';
const linkUrl = 'https://example.com';

describe('ImageViewer', () => {
  it('names the image with the given name', () => {
    const name = 'Neon skyline at dusk';

    render(<ImageViewer url={imageUrl} name={name} width={500} height={300} />);

    expect(screen.getByRole('img', { name })).toHaveAttribute('src', imageUrl);
  });

  it('marks the image as decorative when no name is given', () => {
    const { container } = render(
      <ImageViewer url={imageUrl} width={500} height={300} />
    );

    expect(container.querySelector('img')).toHaveAttribute('alt', '');
  });

  it('names the image with the given name inside a link', () => {
    const name = 'Neon skyline at dusk';

    render(
      <ImageViewer
        url={imageUrl}
        linkUrl={linkUrl}
        name={name}
        width={500}
        height={300}
      />
    );

    expect(screen.getByRole('link')).toContainElement(
      screen.getByRole('img', { name })
    );
  });

  it('names the link with the image name', () => {
    const name = 'Neon skyline at dusk';

    render(
      <ImageViewer
        url={imageUrl}
        linkUrl={linkUrl}
        name={name}
        width={500}
        height={300}
      />
    );

    expect(screen.getByRole('link', { name })).toHaveAttribute('href', linkUrl);
  });

  it('rejects a linked image without a name at the type level', () => {
    const element = (
      // @ts-expect-error -- a linked image needs a name for the link's accessible name.
      <ImageViewer url={imageUrl} linkUrl={linkUrl} width={500} height={300} />
    );

    expect(element).toBeDefined();
  });
});
