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

  it('generates HTML from a template with provided context', () => {
    const mockTemplateContent = '<h1>Hello {{name}}!</h1><p>{{message}}</p>';
    vi.mocked(fs.readFileSync).mockReturnValue(mockTemplateContent);
    const context = {
      name: 'World',
      message: 'Welcome to our website',
    };

    const result = generateHtmlTemplate(mockFilePath, context);

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toBe('<h1>Hello World!</h1><p>Welcome to our website</p>');
  });

  it('handles empty context object', () => {
    const mockTemplateContent = '<div>Static content</div>';
    vi.mocked(fs.readFileSync).mockReturnValue(mockTemplateContent);

    const result = generateHtmlTemplate(mockFilePath, {});

    expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
    expect(result).toBe('<div>Static content</div>');
  });

  it('handles nested properties in context object', () => {
    const mockTemplateContent = '<div>{{user.name}} - {{user.role}}</div>';
    vi.mocked(fs.readFileSync).mockReturnValue(mockTemplateContent);
    const context = {
      user: {
        name: 'John Doe',
        role: 'Admin',
      },
    };

    const result = generateHtmlTemplate(mockFilePath, context);

    expect(result).toBe('<div>John Doe - Admin</div>');
  });

  it('throws error when file cannot be read', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('File not found');
    });

    expect(() => generateHtmlTemplate(mockFilePath, {})).toThrow(
      'File not found'
    );
  });
});
