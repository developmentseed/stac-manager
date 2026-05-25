import React from 'react';
import { List } from '@chakra-ui/react';

type TableValueProps = {
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

function TableValue({ value }: TableValueProps) {
  if (Array.isArray(value)) {
    return (
      <List.Root my='0' as='ul'>
        {value.map((v, i) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <List.Item key={`${i}-${v}`}>{v}</List.Item>
        ))}
      </List.Root>
    );
  }

  if (value === Object(value)) {
    // This is an object
    return (
      <List.Root my='0' as='ul'>
        {Object.entries(value).map(([k, v]) => (
          <List.Item key={k}>
            {k}: <TableValue value={v} />
          </List.Item>
        ))}
      </List.Root>
    );
  }

  return value;
}

export default TableValue;
