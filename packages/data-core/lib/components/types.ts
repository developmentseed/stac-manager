import { SchemaField } from '../schema/types';

export type WidgetComponent = React.FunctionComponent<WidgetProps>;

export interface WidgetProps {
  pointer: string;
  field: SchemaField;
  isRequired?: boolean;
}
