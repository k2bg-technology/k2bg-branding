import Link from 'next/link';
import { Avatar } from 'ui';
import type { Post } from '../../modules/domain/post/types';
import BlogCard from '../blog-card';
import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';

interface Props {
  article: Post;
}

export async function ArticleHeading(props: Props) {
  const { article } = props;

  return (
    <BlogCard className="grid grid-cols-[subgrid] col-span-full gap-spacious">
      <BlogCard.Content
        category={
          <Link
            href={`/category/${article.category}`}
            data-gtm="article_click_category"
          >
            {article.category}
          </Link>
        }
        heading={<h1 className="text-heading-1 font-bold">{article.title}</h1>}
        excerpt={article.excerpt}
        avatar={
          article.author && (
            <Avatar>
              <Avatar.Image alt="author" src={article.author.avatarUrl} />
            </Avatar>
          )
        }
        date={article.releaseDate}
        className="col-span-full xl:col-start-2 xl:col-end-12"
      />
      {article.imageUrl && (
        <BlogCard.Media className="relative w-full h-[18.75rem] md:h-[40rem] col-span-full">
          <CloudinaryImage
            publicId={article.id}
            src={article.imageUrl}
            alt="media"
            className="aspect-square h-full w-full object-cover"
            fill
            sizes="100%"
            priority
          />
        </BlogCard.Media>
      )}
    </BlogCard>
  );
}
