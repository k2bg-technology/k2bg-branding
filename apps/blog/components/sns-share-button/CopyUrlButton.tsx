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
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopyState('success');
      } else {
        // Fallback for browsers without Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = fullUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopyState('success');
        } catch (fallbackError) {
          setCopyState('error');
        }
        
        document.body.removeChild(textArea);
      }
    } catch (error) {
      setCopyState('error');
    }

    // Reset state after 2 seconds
    setTimeout(() => {
      setCopyState('default');
    }, 2000);
  };

  const getIconName = () => {
    switch (copyState) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'x-circle';
      case 'copying':
        return 'arrow-top-right-on-square';
      default:
        return 'arrow-top-right-on-square';
    }
  };

  const getColor = () => {
    switch (copyState) {
      case 'success':
        return 'var(--color-success)';
      case 'error':
        return 'var(--color-error)';
      default:
        return 'var(--color-base-black)';
    }
  };

  const getAriaLabel = () => {
    switch (copyState) {
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
      color="dark"
      size="icon"
      type="button"
      onClick={handleCopy}
      disabled={copyState === 'copying' || !fullUrl}
      aria-label={getAriaLabel()}
    >
      <Icon 
        name={getIconName()} 
        color={getColor()}
        width={20} 
        height={20} 
      />
    </Button>
  );
}