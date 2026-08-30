import { Body } from './Body';
import { Caption } from './Caption';
import { Cell } from './Cell';
import { Footer } from './Footer';
import { Head } from './Head';
import { Header } from './Header';
import { Root } from './Root';
import { Row } from './Row';

const Table = Object.assign(Root, {
  Header,
  Body,
  Footer,
  Row,
  Head,
  Cell,
  Caption,
});

export { Table };
