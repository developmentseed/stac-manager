import { useEffect, useState } from "react";
import { Box, Button, Flex, Icon, Select, Text, useDisclosure } from "@chakra-ui/react";
import { MdExpandLess, MdExpandMore, MdChevronRight, MdChevronLeft } from "react-icons/md";
import { StacItem } from "stac-ts";

import MapView from "./MapView";
import TableView from "./TableView";
import { Sort } from "../SortableTh";
import { LoadingState } from "../../types";
import { usePrevious } from "../../hooks";

type ItemResultsProps = {
  results?: {
    type: "FeatureCollection";
    features: StacItem[]
  };
  sortby?: Sort[];
  setSortby: (sort: Sort[]) => void;
  limit?: number;
  setLimit: (limit: number) => void;
  previousPage?: () => void;
  nextPage?: () => void;
  state: LoadingState;
  submit: () => void;
};

function ItemResults({
  results,
  sortby,
  setSortby,
  limit,
  setLimit,
  previousPage,
  nextPage,
  state,
  submit
}: ItemResultsProps) {
  // Map view state
  const { getDisclosureProps, getButtonProps, isOpen } = useDisclosure();
  const [ highlightItem, setHighlightItem ] = useState<string>();

  // Sort handlers and effects
  const previousSortby = usePrevious(sortby);
  const previousLimit = usePrevious(limit);
  const sort = sortby?.length ? sortby[0] : undefined;
  const handleSort = (sort: Sort) => setSortby([ sort ]);

  useEffect(() => {
    // Automatically execute a new item search if the sorting or limit have changed
    if (sortby !== previousSortby || limit !== previousLimit) {
      submit();
    }
  }, [sortby, previousSortby, submit, limit, previousLimit]);

  return (
    <>
      <Box display="flex" gap="4">
        <Box flex="1">
          <TableView
            results={results}
            compact={isOpen}
            sort={sort}
            handleSort={handleSort}
            state={state}
            highlightItem={highlightItem}
            setHighlightItem={setHighlightItem}
          />
          <Flex mt="4" display="flex" gap="2" fontSize="sm" alignItems="center">
            <Flex flex="1" gap="2" alignItems="baseline">
              <Select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                w="20"
                size="sm"
                id="limit"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
              <Text as="label" htmlFor="limit">items per page</Text>
            </Flex>
            { previousPage && (
              <Button variant="link" size="sm" onClick={previousPage}>
                <Icon as={MdChevronLeft} boxSize="4" />
                Previous page
              </Button>
            )}
            { (previousPage && nextPage) && " | "}
            { nextPage && (
              <Button variant="link" size="sm" onClick={nextPage}>
                Next page
                <Icon as={MdChevronRight} boxSize="4" />
              </Button>
            ) }
          </Flex>
        </Box>
        <MapView {...getDisclosureProps()} results={results} highlightItem={highlightItem} setHighlightItem={setHighlightItem} />
        <Box>
          <Box flex="0" position="sticky" top="4" minWidth="8">
            <Button
              size="sm"
              transformOrigin="bottom left"
              transform="rotate(90deg)"
              position="absolute"
              top="-2rem"
              left="0"
              {...getButtonProps()}
            >
              <Icon as={isOpen ? MdExpandLess : MdExpandMore} boxSize="4" mr="2" ml="-1" />
              {isOpen ? "Hide map" : "Show map"}
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default ItemResults;
