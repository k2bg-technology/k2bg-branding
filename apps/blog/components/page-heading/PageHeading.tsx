import Link from 'next/link';
import { Avatar, BlogCard } from 'ui';

import { CloudinaryImage } from '../cloudinary-image/CloudinaryImage';
import { Post } from '../../modules/domain/post/types';

interface Props {
  article: Post;
}

export async function PageHeading(props: Props) {
  const { article } = props;

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
              <Avatar.Image alt="author" src={article.author.avatarUrl} />
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
        />
      </BlogCard.Media>
    </BlogCard>
  );
}
