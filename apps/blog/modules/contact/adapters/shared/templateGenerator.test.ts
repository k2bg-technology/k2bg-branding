import fs from 'fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { generateHtmlTemplate } from './templateGenerator';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

describe('generateHtmlTemplate', () => {
  const mockFilePath = '/path/to/template.html';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the template from the requested file with the supplied context', () => {
    const templates = new Map([
      [mockFilePath, '<h1>Hello {{name}}!</h1><p>{{message}}</p>'],
    ]);
    vi.mocked(fs.readFileSync).mockImplementation(
      (filePath) => templates.get(String(filePath)) ?? ''
    );
    const context = {
      name: 'World',
      message: 'Welcome to our website',
    };

    const result = generateHtmlTemplate(mockFilePath, context);

    expect(result).toBe('<h1>Hello World!</h1><p>Welcome to our website</p>');
  });

  it('should throw an error when file cannot be read', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(() => generateHtmlTemplate(mockFilePath, {})).toThrow(
      'File not found'
    );
  });
});
