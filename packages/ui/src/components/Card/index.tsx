import { Content } from './Content';
import { Description } from './Description';
import { Header } from './Header';
import { Root } from './Root';
import { Title } from './Title';

const Card = Object.assign(Root, {
  Header,
  Title,
  Description,
  Content,
});

export { Card };
