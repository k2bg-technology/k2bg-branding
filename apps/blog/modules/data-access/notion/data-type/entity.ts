import { DATA_TYPE_NAMES, type DataType, type DataTypeCore } from './types';

export class Entity implements DataTypeCore {
  constructor(private data: DataType) {}

  get name() {
    const dataType = this.data.getDataType();

    return DATA_TYPE_NAMES.find((type) => type === dataType);
  }
}
