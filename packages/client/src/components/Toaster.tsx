import React from 'react';
import {
  Toast,
  Toaster as ChakraToaster,
  createToaster
} from '@chakra-ui/react';

import { AppNotification, NotificationBox } from './Notifications';

/**
 * Singleton toast store for the app. Replaces Chakra v2's `useToast` hook.
 *
 * Usage:
 *   import { toaster } from '$components/Toaster';
 *   toaster.create({ id, title, type: 'success', duration: 5000 });
 *   toaster.update(id, { title, type: 'success' });
 *   toaster.dismiss(id);   // dismiss one
 *   toaster.dismiss();     // dismiss all
 *   toaster.isVisible(id);
 *
 * For custom-rendered toasts (e.g. the notifications panel), set
 * `meta: { kind: 'notifications', notifications }`. The render function in
 * `<Toaster />` switches on `meta.kind` to choose the JSX shape.
 */
export const toaster = createToaster({
  placement: 'bottom-end',
  pauseOnPageIdle: true
});

interface NotificationsToastMeta {
  kind: 'notifications';
  notifications: AppNotification[];
}

function isNotificationsMeta(
  meta: Record<string, any> | undefined
): meta is NotificationsToastMeta {
  return !!meta && meta.kind === 'notifications';
}

/**
 * Mounts the toast region once near the root of the app. Renders custom JSX
 * for `meta.kind === 'notifications'` toasts; otherwise renders the default
 * Toast.Root / Title / Description / CloseTrigger shape.
 */
export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => {
        if (isNotificationsMeta(toast.meta)) {
          return (
            <Toast.Root>
              <NotificationBox
                notifications={toast.meta.notifications}
                onCloseClick={() => toaster.dismiss(toast.id)}
              />
            </Toast.Root>
          );
        }

        return (
          <Toast.Root>
            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
            {toast.description && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
            {toast.closable !== false && <Toast.CloseTrigger />}
          </Toast.Root>
        );
      }}
    </ChakraToaster>
  );
}
