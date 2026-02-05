import { Box } from './Box/Box';
import { Line } from './Line/Line';
import { Round } from './Round/Round';
import { Skelton as Root } from './Skelton';

const Skelton = Object.assign(Root, { Line, Box, Round });

export { Skelton };
