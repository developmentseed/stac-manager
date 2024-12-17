import { As, Box, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { Property, PropertyGroup } from "../../types";
import TableValue from "./TableValue";

type PropertyListProps = {
  properties: PropertyGroup;
  headerLevel?: As;
}

type PropType = [string, Property]

const IGNORE_PROPS = ["proj:bbox", "proj:geometry"];

function PropertyList({ properties, headerLevel = "h2" }: PropertyListProps) {
  const { label, properties: props } = properties;
  return (
    <Box borderTop="1px dashed" borderColor="gray.200" mt="4" pt="4" pb="3">
      <Text as={headerLevel} fontSize="sm" mt="0">{label || "Common Metadata"}</Text>
      {Object.entries(props)
        .filter(([ key ]: PropType) => !IGNORE_PROPS.includes(key))
        .map(([ key, val ]: PropType, index: number) => (
          (val.itemOrder && val.itemOrder.length > 1) ? (
            <Box key={key}>
              <Text>{val.label}</Text>
              <TableContainer>
                <Table size="sm">
                  <Thead>
                    <Tr>
                      { val.itemOrder.map((item) => (
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        <Th key={item}>{val.items![item].label}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    { val.value.map((value) => (
                      <Tr key={JSON.stringify(value)}>
                        {val.itemOrder.map((item) => (
                          <Td key={item} valign="top">
                            <TableValue value={value[item]} />
                          </Td>
                        ))}
                      </Tr>
                    )) }
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box
              key={key}
              bgColor={index % 2 === 0 ? "gray.50" : "inherit"}
              display="grid"
              gridTemplateColumns="1fr 1fr"
              gap="2"
              px="2"
              py="1"
            >
              <Box dangerouslySetInnerHTML={{__html: val.label}} />
              <Box dangerouslySetInnerHTML={{__html: val.formatted}} />
            </Box>
          )
        ))}
    </Box>
  );
}

export default PropertyList;
