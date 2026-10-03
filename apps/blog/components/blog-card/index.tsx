import { Content } from './Content';
import { Media } from './Media';
import { Root } from './Root';
import { Skeleton } from './Skeleton';

const BlogCard = Object.assign(Root, { Content, Media, Skeleton });

export { BlogCard };
