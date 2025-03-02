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
    <BlogCard className="grid grid-cols-[subgrid] col-span-full gap-spacious">
      <BlogCard.Content
        category={
          <Link href={`/category/${article.category}`}>{article.category}</Link>
        }
        heading={<h1 className="text-heading-1 font-bold">{article.title}</h1>}
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
      <BlogCard.Media className="relative w-full h-[40rem] col-span-full">
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
    </BlogCard>
  );
}
