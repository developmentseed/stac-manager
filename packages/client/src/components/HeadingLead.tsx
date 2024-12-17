import { Text } from "@chakra-ui/react";

export function HeadingLead({ children }: React.PropsWithChildren) {
  return (
    <Text
      as="span"
      display="block"
      fontSize="sm"
      textTransform="uppercase"
      color="gray.500"
    >
      { children }
    </Text>
  );
}

export default HeadingLead;
