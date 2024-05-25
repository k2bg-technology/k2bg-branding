'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { Form, Icon } from 'ui';

interface Props {
  placeholder: string;
}

export default function Search(props: Props) {
  const { placeholder } = props;

  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`/search?${params.toString()}`);
  }, 500);

  return (
    <div className="relative flex">
      <label htmlFor="search" className="sr-only">
        検索
      </label>
      <Form.Input
        id="search"
        type="search"
        startAdornment={<Icon name="magnifying-glass" width={20} height={20} />}
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()}
      />
    </div>
  );
}
