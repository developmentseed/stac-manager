import React, { Dispatch, SetStateAction } from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';

import { usePaginate } from '$utils/usePaginateHook';
import { zeroPad } from '$utils/format';

interface PaginationProps {
  page: number;
  numPages: number;
  onPageChange: Dispatch<SetStateAction<number>>;
}

export function Pagination(props: PaginationProps) {
  const { numPages, page, onPageChange } = props;
  const paginate = usePaginate({
    numPages,
    currentPage: page,
    onPageChange
  });

  return (
    <ButtonGroup size='sm' variant='outline' attached>
      <Button onClick={paginate.goFirst} disabled={!paginate.hasPrevious}>
        First
      </Button>
      <Button onClick={paginate.goPrevious} disabled={!paginate.hasPrevious}>
        Previous
      </Button>
      {paginate.left.map((p) => (
        <Button key={p} onClick={() => paginate.goToPage(p)}>
          {zeroPad(p)}
        </Button>
      ))}
      {paginate.hasLeftBreak && <Button disabled>...</Button>}
      {paginate.pages.map((p) => (
        <Button
          key={p}
          onClick={() => paginate.goToPage(p)}
          variant={p === page ? 'solid' : 'outline'}
          colorPalette={p === page ? 'primary' : undefined}
        >
          {zeroPad(p)}
        </Button>
      ))}
      {paginate.hasRightBreak && <Button disabled>...</Button>}
      {paginate.right.map((p) => (
        <Button key={p} onClick={() => paginate.goToPage(p)}>
          {zeroPad(p)}
        </Button>
      ))}
      <Button onClick={paginate.goNext} disabled={!paginate.hasNext}>
        Next
      </Button>
      <Button onClick={paginate.goLast} disabled={!paginate.hasNext}>
        Last
      </Button>
    </ButtonGroup>
  );
}
