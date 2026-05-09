import { Close } from './Close';
import { Popup } from './Popup';
import { Positioner } from './Positioner';
import { Root } from './Root';
import { Trigger } from './Trigger';

const Popover = Object.assign(Root, { Trigger, Positioner, Popup, Close });

export { Popover };
