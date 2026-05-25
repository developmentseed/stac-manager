import React from 'react';
import { Box, Table, Text } from '@chakra-ui/react';
import { Property, PropertyGroup } from '../../types';
import TableValue from './TableValue';

type PropertyListProps = {
  properties: PropertyGroup;
  headerLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

type PropType = [string, Property];

const IGNORE_PROPS = ['proj:bbox', 'proj:geometry'];

function PropertyList({ properties, headerLevel = 'h2' }: PropertyListProps) {
  const { label, properties: props } = properties;
  return (
    <Box borderTop='1px dashed' borderColor='gray.200' mt='4' pt='4' pb='3'>
      <Text as={headerLevel} fontSize='sm' mt='0'>
        {label || 'Common Metadata'}
      </Text>
      {Object.entries(props)
        .filter(([key]: PropType) => !IGNORE_PROPS.includes(key))
        .map(([key, val]: PropType, index: number) =>
          val.itemOrder && val.itemOrder.length > 1 ? (
            <Box key={key}>
              <Text>{val.label}</Text>
              <Table.ScrollArea>
                <Table.Root size='sm'>
                  <Table.Header>
                    <Table.Row>
                      {val.itemOrder.map((item) => (
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        <Table.ColumnHeader key={item}>
                          {val.items![item].label}
                        </Table.ColumnHeader>
                      ))}
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {val.value.map((value) => (
                      <Table.Row key={JSON.stringify(value)}>
                        {val.itemOrder.map((item) => (
                          <Table.Cell key={item} valign='top'>
                            <TableValue value={value[item]} />
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Table.ScrollArea>
            </Box>
          ) : (
            <Box
              key={key}
              bgColor={index % 2 === 0 ? 'gray.50' : 'inherit'}
              display='grid'
              gridTemplateColumns='1fr 1fr'
              gap='2'
              px='2'
              py='1'
            >
              <Box dangerouslySetInnerHTML={{ __html: val.label }} />
              <Box dangerouslySetInnerHTML={{ __html: val.formatted }} />
            </Box>
          )
        )}
    </Box>
  );
}

export default PropertyList;
