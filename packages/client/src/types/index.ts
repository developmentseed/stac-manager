export type GenericObject = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export type ApiError = {
  detail?: GenericObject | string;
  status: number;
  statusText: string;
};
