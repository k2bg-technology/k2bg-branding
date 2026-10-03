import { useEffect, useState } from 'react';

export interface SnsShareInfo {
  title: string;
  fullUrl: string;
}

export function useSnsShareInfo(): SnsShareInfo {
  const [title, setTitle] = useState('');
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    setTitle(document.title);
    setFullUrl(window.location.href);
  }, []);

  return { title, fullUrl };
}
