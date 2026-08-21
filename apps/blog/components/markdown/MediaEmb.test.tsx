import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaType } from '../../modules/media/domain';
import type { MediaOutput } from '../../modules/media/use-cases';
import { MediaEmb } from './MediaEmb';

const { mockExecute, mockLoggerError } = vi.hoisted(() => ({
  mockExecute: vi.fn(),
  mockLoggerError: vi.fn(),
}));

vi.mock('../../infrastructure/di/media', () => ({
  createFetchMediaUseCase: () => ({ execute: mockExecute }),
}));

vi.mock('../../modules/media/adapters/shared/logger', () => ({
  mediaLogger: { error: mockLoggerError },
}));

vi.mock('./MediaImage', () => ({
  MediaImage: () => <div data-testid="media-image" />,
}));

vi.mock('./MediaVideo', () => ({
  MediaVideo: () => <div data-testid="media-video" />,
}));

const createMediaFixture = (): MediaOutput => ({
  id: 'media-1',
  name: 'Sample media',
  type: MediaType.IMAGE,
  sourceFile: null,
  sourceUrl: 'https://example.com/sample.png',
  targetUrl: null,
  width: 640,
  height: 480,
  extension: 'png',
  effectiveSource: 'https://example.com/sample.png',
});

describe('MediaEmb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing and logs the cause when the media fetch fails', async () => {
    const id = 'media-1';
    const fetchError = new Error('Media source is unavailable');
    mockExecute.mockRejectedValue(fetchError);

    const { container } = render(await MediaEmb({ id }));

    expect(container).toBeEmptyDOMElement();
    expect(mockLoggerError).toHaveBeenCalledWith(
      { err: fetchError, id },
      'Failed to fetch media embed'
    );
  });

  it('renders the media when the fetch succeeds', async () => {
    const media = createMediaFixture();
    mockExecute.mockResolvedValue({ media });

    render(await MediaEmb({ id: media.id }));

    expect(screen.getByTestId('media-image')).toBeInTheDocument();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });
});
