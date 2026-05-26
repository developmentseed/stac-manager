import { useCallback } from 'react';

function sq(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export function usePaginate({
  numPages,
  currentPage,
  onPageChange,
  marginsRange = 2,
  pageRange = 3
}: {
  numPages: number;
  currentPage: number;
  onPageChange: React.Dispatch<React.SetStateAction<number>>;
  marginsRange?: number;
  pageRange?: number;
}) {
  const pageRangeHalf = Math.floor(pageRange / 2);
  const marginsRangeAndEllipsis = marginsRange ? marginsRange + 2 : 0;

  const hasNext = currentPage < numPages;
  const hasPrevious = currentPage > 1;

  const goNext = useCallback(() => {
    if (hasNext) {
      onPageChange((v) => v + 1);
    }
  }, [hasNext, onPageChange]);
  const goPrevious = useCallback(() => {
    if (hasPrevious) {
      onPageChange((v) => v - 1);
    }
  }, [hasPrevious, onPageChange]);
  const goFirst = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);
  const goLast = useCallback(() => {
    onPageChange(numPages);
  }, [numPages, onPageChange]);
  const goToPage = useCallback(
    (page: number) => {
      if (page > 0 && page <= numPages) {
        onPageChange(page);
      }
    },
    [numPages, onPageChange]
  );

  if (pageRange < 1) {
    throw new Error('pageRange must be at least 1');
  }

  if (marginsRange < 0) {
    throw new Error('marginsRange cannot be negative');
  }

  if (currentPage < 1 || currentPage > numPages) {
    throw new Error('current page is out of bounds. [1, numPages]');
  }

  let left: number[] = [];
  let right: number[] = [];
  let pages: number[] = [];

  if (numPages <= pageRange + 2 * (marginsRange + 1)) {
    left = [];
    right = [];
    pages = sq(1, numPages);
  } else {
    // Create the pages array taking the page range into account.
    // It is adjusted if needed below
    pages = sq(currentPage - pageRangeHalf, currentPage + pageRangeHalf);

    // We only show the left side when there's enough space to show whole margin
    // plus the ellipsis plus at least one page hidden before half the page
    // range.
    if (currentPage > marginsRangeAndEllipsis + pageRangeHalf) {
      left = sq(1, marginsRange);
    } else {
      // Adjust the pages array to the left.
      pages = sq(
        1,
        Math.max(marginsRangeAndEllipsis + pageRangeHalf * 2, pageRange)
      );
    }

    // Same behavior for the right side.
    if (currentPage < numPages - marginsRangeAndEllipsis - pageRangeHalf + 1) {
      right = sq(numPages - marginsRange + 1, numPages);
    } else {
      // Adjust the pages array to the right.
      pages = sq(
        numPages -
          Math.max(marginsRangeAndEllipsis + pageRangeHalf, pageRange - 1),
        numPages
      );
    }
  }

  return {
    pages,
    left,
    right,
    hasLeftBreak: !!left.length,
    hasRightBreak: !!right.length,
    goNext,
    goPrevious,
    goFirst,
    goLast,
    goToPage,
    hasNext,
    hasPrevious
  };
}
