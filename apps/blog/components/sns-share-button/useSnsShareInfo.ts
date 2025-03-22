import { useEffect, useState } from 'react';

export function useSnsShareInfo() {
  const [title, setTitle] = useState('');
  const [fullUrl, setFullUrl] = useState('');

  useEffect(() => {
    setTitle(document.title);
    setFullUrl(window.location.href);
  }, []);

  return { title, fullUrl };
}
