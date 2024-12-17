import { Button, Icon, Th } from "@chakra-ui/react";
import { MdExpandLess, MdExpandMore } from "react-icons/md";

export type Sort = {
  field: string;
  direction: "asc" | "desc";
}

type Props = {
  children: string;
  fieldName: string;
  sort?: Sort;
  setSort: (sort: Sort) => void;
}

function SortableTh({ children, sort, setSort, fieldName }: Props) {
  const { field, direction } = sort || {};
  let SortIcon = undefined;
  let ariaSort: "ascending" | "descending" | undefined = undefined;

  if (field === fieldName) {
    SortIcon = direction === "asc" ? MdExpandLess : MdExpandMore;
    ariaSort = direction === "asc" ? "ascending" : "descending";
  }

  return (
    <Th aria-sort={ariaSort}>
      <Button
        bgColor="white"
        p="0"
        fontSize="xs"
        height="0"
        minW="0"
        textTransform="uppercase"
        letterSpacing="0.6px"
        onClick={() => setSort({ field: fieldName, direction: direction === "asc" ? "desc" : "asc" })}
      >
        { children }
        {SortIcon && <Icon as={SortIcon} boxSize="4" />}
      </Button>
    </Th>
  );
}

export default SortableTh;
