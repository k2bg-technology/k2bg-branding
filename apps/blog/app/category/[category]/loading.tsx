import { Skelton } from 'ui';
import { ArticlesSkelton } from '../../../components/articles/ArticlesSkelton';

export default function Loading() {
  return (
    <>
      <Skelton.Line className="w-[10rem] h-[1.875rem]" />
      <ArticlesSkelton />
    </>
  );
}
