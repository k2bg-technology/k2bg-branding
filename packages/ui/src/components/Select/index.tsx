import { Item } from './Item';
import { Label } from './Label';
import { Popup } from './Popup';
import { Root } from './Root';
import { Trigger } from './Trigger';

const Select = Object.assign(Root, { Label, Trigger, Popup, Item });

export { Select };
