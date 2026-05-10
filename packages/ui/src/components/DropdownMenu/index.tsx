import { Item } from './Item';
import { Popup } from './Popup';
import { Positioner } from './Positioner';
import { Root } from './Root';
import { Trigger } from './Trigger';

const DropdownMenu = Object.assign(Root, { Trigger, Positioner, Popup, Item });

export { DropdownMenu };
