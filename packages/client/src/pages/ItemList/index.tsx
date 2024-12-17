import React, { useEffect } from 'react';
import { Flex } from '@chakra-ui/react';
import { useStacSearch } from '@developmentseed/stac-react';

import { usePageTitle } from '../../hooks';
import ItemListFilter from './ItemListFilter';
import ItemResults from '../../components/ItemResults';
import { InnerPageHeader } from '$components/InnerPageHeader';

function ItemList() {
  usePageTitle('Items');
  const {
    results,
    state,
    sortby,
    setSortby,
    limit,
    setLimit,
    submit,
    nextPage,
    previousPage,
    ...searchState
  } = useStacSearch();

  // Submit handlers and effects
  useEffect(() => {
    // Automatically submit to receive initial results
    if (results) return;
    submit();
  }, [submit]);

  return (
    <Flex direction='column' gap={8} p={4}>
      <InnerPageHeader overline='Browsing' title='All Items' />
      <ItemListFilter submit={submit} {...searchState} />
      <ItemResults
        results={results}
        sortby={sortby}
        setSortby={setSortby}
        limit={limit}
        setLimit={setLimit}
        previousPage={previousPage}
        nextPage={nextPage}
        state={state}
        submit={submit}
      />
    </Flex>
  );
}

export default ItemList;
