import { renderHook, act } from '@testing-library/react';
import { usePaginate } from './usePaginateHook';

describe('usePaginate', () => {
  it('should initialize pagination correctly', () => {
    const { result } = renderHook(() =>
      usePaginate({ numPages: 20, currentPage: 10, onPageChange: jest.fn() })
    );

    expect(result.current.pages).toEqual([9, 10, 11]);
    expect(result.current.left).toEqual([1, 2]);
    expect(result.current.right).toEqual([19, 20]);
    expect(result.current.hasLeftBreak).toBe(true);
    expect(result.current.hasRightBreak).toBe(true);
  });

  it('should handle next page correctly', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 1, onPageChange })
    );

    act(() => {
      result.current.goNext();
    });

    expect(onPageChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(expect.any(Function));
    // The fn should increase by one.
    expect(onPageChange.mock.lastCall[0](10)).toEqual(11);
  });

  it('should handle previous page correctly', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 2, onPageChange })
    );

    act(() => {
      result.current.goPrevious();
    });

    expect(onPageChange).toHaveBeenCalled();
    expect(onPageChange).toHaveBeenCalledWith(expect.any(Function));
    // The fn should decrease by one.
    expect(onPageChange.mock.lastCall[0](10)).toEqual(9);
  });

  it('should handle first page correctly', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 5, onPageChange })
    );

    act(() => {
      result.current.goFirst();
    });

    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should handle last page correctly', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 5, onPageChange })
    );

    act(() => {
      result.current.goLast();
    });

    expect(onPageChange).toHaveBeenCalledWith(10);
  });

  it('should handle go to specific page correctly', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 5, onPageChange })
    );

    act(() => {
      result.current.goToPage(3);
    });

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should not go to an invalid page', () => {
    const onPageChange = jest.fn();
    const { result } = renderHook(() =>
      usePaginate({ numPages: 10, currentPage: 5, onPageChange })
    );

    act(() => {
      result.current.goToPage(11);
    });

    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('should not have margins when fewer than needed pages.', () => {
    // Needed pages are pageRange + 2 * (marginsRange + 1)
    // 2 * (marginsRange + 1) to have space for the ellipsis on each side
    // Default values are 2 for marginsRange and 5 for pageRange
    const { result } = renderHook(() =>
      usePaginate({
        numPages: 10,
        currentPage: 1,
        onPageChange: jest.fn(),
        pageRange: 5,
        marginsRange: 2
      })
    );

    expect(result.current.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(result.current.left).toEqual([]);
    expect(result.current.right).toEqual([]);
    expect(result.current.hasLeftBreak).toBe(false);
    expect(result.current.hasRightBreak).toBe(false);
  });

  it('should render correctly when pageRange and marginsRange change', () => {
    const { result } = renderHook(() =>
      usePaginate({
        numPages: 11,
        currentPage: 6,
        onPageChange: jest.fn(),
        pageRange: 5,
        marginsRange: 1
      })
    );
    // Min blocks (between pages and ellipsis): 5 + 2 * (1 + 1) = 9

    expect(result.current.pages).toEqual([4, 5, 6, 7, 8]);
    expect(result.current.left).toEqual([1]);
    expect(result.current.right).toEqual([11]);
    expect(result.current.hasLeftBreak).toBe(true);
    expect(result.current.hasRightBreak).toBe(true);
  });

  it('should render correctly as pages change', () => {
    const { result, rerender } = renderHook((page: number = 1) =>
      usePaginate({
        numPages: 20,
        onPageChange: jest.fn(),
        currentPage: page
      })
    );

    // Min blocks (between pages and ellipsis): 3 + 2 * (2 + 1) = 9

    // Until page 5 it won't change anything because for the left side to have
    // pages we need a minimum of pageMargin (2) + ellipsis (1) + page to be
    // hidden (1) + half the page range (1)

    for (let index = 1; index < 6; index++) {
      rerender(index);

      expect(result.current.pages).toEqual([1, 2, 3, 4, 5, 6]);
      expect(result.current.left).toEqual([]);
      expect(result.current.right).toEqual([19, 20]);
      expect(result.current.hasLeftBreak).toBe(false);
      expect(result.current.hasRightBreak).toBe(true);
    }

    // from 6 to we have a left and a right margin.
    for (let index = 6; index < 16; index++) {
      rerender(index);

      expect(result.current.pages).toEqual([index - 1, index, index + 1]);
      expect(result.current.left).toEqual([1, 2]);
      expect(result.current.right).toEqual([19, 20]);
      expect(result.current.hasLeftBreak).toBe(true);
      expect(result.current.hasRightBreak).toBe(true);
    }

    // from 16 to 20 we don't have a right margin.
    for (let index = 16; index <= 20; index++) {
      rerender(index);

      expect(result.current.pages).toEqual([15, 16, 17, 18, 19, 20]);
      expect(result.current.left).toEqual([1, 2]);
      expect(result.current.right).toEqual([]);
      expect(result.current.hasLeftBreak).toBe(true);
      expect(result.current.hasRightBreak).toBe(false);
    }
  });

  it('should render correctly as pages change for margin 0', () => {
    const { result, rerender } = renderHook((page: number = 1) =>
      usePaginate({
        numPages: 10,
        onPageChange: jest.fn(),
        currentPage: page,
        marginsRange: 0
      })
    );

    // Since there are no margins there should always be the pageRange pages
    expect(result.current.pages).toEqual([1, 2, 3]);
    expect(result.current.left).toEqual([]);
    expect(result.current.right).toEqual([]);
    expect(result.current.hasLeftBreak).toBe(false);
    expect(result.current.hasRightBreak).toBe(false);

    for (let index = 2; index < 10; index++) {
      rerender(index);

      expect(result.current.pages).toEqual([index - 1, index, index + 1]);
      expect(result.current.left).toEqual([]);
      expect(result.current.right).toEqual([]);
      expect(result.current.hasLeftBreak).toBe(false);
      expect(result.current.hasRightBreak).toBe(false);
    }

    rerender(10);

    expect(result.current.pages).toEqual([8, 9, 10]);
    expect(result.current.left).toEqual([]);
    expect(result.current.right).toEqual([]);
    expect(result.current.hasLeftBreak).toBe(false);
    expect(result.current.hasRightBreak).toBe(false);
  });

  it('should throw an error when currentPage is out of bounds', () => {
    expect.assertions(1);
    try {
      renderHook(() =>
        usePaginate({ numPages: 10, currentPage: 11, onPageChange: jest.fn() })
      );
    } catch (error) {
      expect((error as Error).message).toEqual(
        'current page is out of bounds. [1, numPages]'
      );
    }
  });

  it('should throw an error when page range is less than 1', () => {
    expect.assertions(1);
    try {
      renderHook(() =>
        usePaginate({
          numPages: 10,
          currentPage: 1,
          onPageChange: jest.fn(),
          pageRange: 0
        })
      );
    } catch (error) {
      expect((error as Error).message).toEqual('pageRange must be at least 1');
    }
  });

  it('should throw an error when marginRange is negative', () => {
    expect.assertions(1);
    try {
      renderHook(() =>
        usePaginate({
          numPages: 10,
          currentPage: 1,
          onPageChange: jest.fn(),
          marginsRange: -1
        })
      );
    } catch (error) {
      expect((error as Error).message).toEqual(
        'marginsRange cannot be negative'
      );
    }
  });
});
