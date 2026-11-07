import { Content } from './Content';
import { Header } from './Header';
import { Root } from './Root';

const PageLayout = Object.assign(Root, { Header, Content });

export { PageLayout };
