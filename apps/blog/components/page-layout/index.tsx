import { Aside } from './Aside';
import { Content } from './Content';
import { Divider } from './Divider';
import { FloatingActions } from './FloatingActions';
import { Root } from './Root';
import { Row } from './Row';

const PageLayout = Object.assign(Root, {
  Row,
  Content,
  Aside,
  Divider,
  FloatingActions,
});

export { PageLayout };
