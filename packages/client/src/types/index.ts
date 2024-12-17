export type GenericObject = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ApiError = {
  detail?: GenericObject | string;
  status: number;
  statusText: string;
};

export type LoadingState = 'IDLE' | 'LOADING';

export type PropertyItem = {
  label: string;
  sortable: boolean;
  order: 1;
};

export type Property = {
  formatted: string;
  itemOrder: string[];
  items?: { [key: string]: PropertyItem };
  label: string;
  value: GenericObject[];
};

export type PropertyGroup = {
  extension: string;
  label: string;
  properties: {
    [key: string]: Property;
  };
};
