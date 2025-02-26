import React from 'react';
import { ListItem, UnorderedList } from '@chakra-ui/react';

type TableValueProps = {
  value: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

function TableValue({ value }: TableValueProps) {
  if (Array.isArray(value)) {
    return (
      <UnorderedList my='0'>
        {value.map((v, i) => (
          /* eslint-disable-next-line react/no-array-index-key */
          <ListItem key={`${i}-${v}`}>{v}</ListItem>
        ))}
      </UnorderedList>
    );
  }

  if (value === Object(value)) {
    // This is an object
    return (
      <UnorderedList my='0'>
        {Object.entries(value).map(([k, v]) => (
          <ListItem key={k}>
            {k}: <TableValue value={v} />
          </ListItem>
        ))}
      </UnorderedList>
    );
  }

  return value;
}

export default TableValue;
