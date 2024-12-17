import { useEffect } from 'react';

function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
export default usePageTitle;
