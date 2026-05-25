/**
 * Temporary shim for Chakra v2 `useToast` API.
 *
 * Chakra v3 removed `useToast` in favor of a singleton `toaster` + `<Toaster />`
 * mount. Replacing the call sites is tracked as task B-7. Until then, this shim
 * keeps the build green by providing a no-op implementation that mirrors the v2
 * shape the existing call sites expect.
 *
 * Behavior: every method is a no-op (or returns false/undefined). Calling code
 * will compile and run; toasts simply won't render until B-7 wires up the v3
 * toaster.
 */
export interface ToastShimOptions {
  id?: string;
  title?: string;
  description?: string;
  status?: 'success' | 'error' | 'warning' | 'info' | 'loading';
  position?: string;
  duration?: number | null;
  isClosable?: boolean;
  render?: (props: { onClose: () => void }) => React.ReactNode;
}

export interface ToastShim {
  (opts: ToastShimOptions): string | number | undefined;
  close: (id: string | number) => void;
  closeAll: () => void;
  update: (id: string | number, opts: ToastShimOptions) => void;
  isActive: (id: string | number) => boolean;
}

export function useToast(): ToastShim {
  const toast = ((_opts: ToastShimOptions) => undefined) as ToastShim;
  toast.close = () => {};
  toast.closeAll = () => {};
  toast.update = () => {};
  toast.isActive = () => false;
  return toast;
}
