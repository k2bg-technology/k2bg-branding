import Link from 'next/link';
import Image from 'next/image';
import { Avatar, BlogCard } from 'ui';

import Notion from '../../modules/data-access/notion';
import Article from '../../modules/domain/article';
import Cloudinary from '../../modules/data-access/cloudinary';

const getArticle = async (pageId: string) => {
  const notionFetcher = new Notion.Fetcher();
  const page = new Notion.Page(await notionFetcher.fetchPage(pageId));
  const article = new Article.Single(page);

  return article;
};

interface Props {
  articleId: string;
}

export async function ArticleHeading(props: Props) {
  const { articleId } = props;

  const article = await getArticle(articleId);

  const placeholder = await article.imagePlaceholder;

  if (!article.image) throw new Error('No image found');

  const publicId = article.id;

  await new Cloudinary.Uploader().uploadImage(article.image, {
    public_id: publicId,
  });

  const optimizedUrl = await new Cloudinary.Fetcher().getImageUrl(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
  });

  return (
    <BlogCard className="flex-col gap-6">
      <BlogCard.Content
        category={
          <Link href={`/category/${article.category}`}>{article.category}</Link>
        }
        heading={<h1 className="text-header-1 font-bold">{article.title}</h1>}
        excerpt={article.excerpt}
        avatar={
          article.author && (
            <Avatar
              image={
                <div className="relative w-full h-full">
                  <Image
                    alt="author"
                    src={article.author.avatar_url ?? ''}
                    className="aspect-square h-full w-full object-cover"
                    fill
                    sizes="100%"
                  />
                </div>
              }
              name={article.author.name ?? ''}
            />
          )
        }
        date={article.releaseDate}
      />
      <BlogCard.Media className="relative w-full h-[37.6rem]">
        <Image
          alt="media"
          src={optimizedUrl}
          className="aspect-square h-full w-full object-cover"
          fill
          sizes="100%"
          placeholder="blur"
          blurDataURL={placeholder}
          priority
          unoptimized={article.imageExtension === '.gif'}
          quality={30}
        />
      </BlogCard.Media>
    </BlogCard>
  );
}
