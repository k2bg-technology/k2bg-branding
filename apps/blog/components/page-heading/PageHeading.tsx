import Link from 'next/link';
import { Avatar, BlogCard } from 'ui';

import Notion from '../../modules/data-access/notion';
import Article from '../../modules/domain/article';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

interface Props {
  articleId: string;
}

export async function PageHeading(props: Props) {
  const { articleId } = props;

  const page = new Notion.Page(await new Notion.Fetcher().fetchPage(articleId));
  const article = new Article.Single(page);

  if (!article.image) throw new Error('No image found');

  return (
    <BlogCard className="flex-col gap-spacious">
      <BlogCard.Content
        category={
          <Link href={`/category/${article.category}`}>{article.category}</Link>
        }
        heading={<h1 className="text-header-1 font-bold">{article.title}</h1>}
        excerpt={article.excerpt}
        avatar={
          article.author && (
            <Avatar>
              <Avatar.Image
                alt="author"
                src={article.author.avatar_url ?? ''}
              />
            </Avatar>
          )
        }
        date={article.releaseDate}
      />
      <BlogCard.Media className="relative w-full h-[23.5rem]">
        <CloudinaryImage
          publicId={article.id}
          alt="media"
          className="aspect-square h-full w-full object-cover"
          fill
          sizes="100%"
          priority
          unoptimized={article.imageExtension === '.gif'}
        />
      </BlogCard.Media>
    </BlogCard>
  );
}
