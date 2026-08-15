import { Box } from './Box/Box';
import { Line } from './Line/Line';
import { Round } from './Round/Round';
import { Skeleton as Root } from './Skeleton';

const Skeleton = Object.assign(Root, { Line, Box, Round });

export { Skeleton };
