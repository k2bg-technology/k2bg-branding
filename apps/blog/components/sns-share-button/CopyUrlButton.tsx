'use client';

import { useState } from 'react';
import { Button, Icon } from 'ui';

import { useSnsShareInfo } from './useSnsShareInfo';

type CopyState = 'default' | 'copying' | 'success' | 'error';

export default function CopyUrlButton() {
  const { fullUrl } = useSnsShareInfo();
  const [copyState, setCopyState] = useState<CopyState>('default');

  const handleCopy = async () => {
    if (!fullUrl) return;

    setCopyState('copying');

    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopyState('success');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        if (document.execCommand('copy')) {
          setCopyState('success');
        } else {
          setCopyState('error');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      setCopyState('error');
    }

    // Reset to default after 2 seconds
    setTimeout(() => {
      setCopyState('default');
    }, 2000);
  };

  const getIconName = (state: CopyState) => {
    switch (state) {
      case 'copying':
        return 'clipboard';
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      default:
        return 'clipboard';
    }
  };

  const getButtonColor = (state: CopyState) => {
    switch (state) {
      case 'success':
        return 'success' as const;
      case 'error':
        return 'error' as const;
      default:
        return 'dark' as const;
    }
  };

  const getAriaLabel = (state: CopyState) => {
    switch (state) {
      case 'copying':
        return 'Copying URL...';
      case 'success':
        return 'URL copied successfully';
      case 'error':
        return 'Failed to copy URL';
      default:
        return 'Copy URL to clipboard';
    }
  };

  return (
    <Button
      variant="ghost"
      color={getButtonColor(copyState)}
      size="icon"
      type="button"
      onClick={handleCopy}
      disabled={copyState === 'copying'}
      aria-label={getAriaLabel(copyState)}
    >
      <Icon name={getIconName(copyState)} width={20} height={20} />
    </Button>
  );
}