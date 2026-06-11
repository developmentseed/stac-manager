import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Text
} from '@chakra-ui/react';
import { toaster } from '$components/Toaster';
import {
  CollecticonBell,
  CollecticonCircleExclamation,
  CollecticonXmarkSmall
} from '@devseed-ui/collecticons-chakra';
import React from 'react';

interface DetailResponse {
  status: number;
  statusText: string;
  // The shape depends on the server: FastAPI validation errors give us
  // { detail: { loc, msg }[], body }; an IdP can return a string or
  // { error_description }; STAC implementations vary. Kept loose so
  // extractErrorMessage can branch on it.
  detail?: unknown;
}

export type AppNotification =
  | {
      type: 'validation-error';
      id: number;
      title?: string;
      path: string;
      message: string;
    }
  | {
      type: 'error';
      id: number;
      title?: string;
      message: string;
    };

// Pull a human-readable message out of whatever shape the server returned.
// Covers the common ones: plain string body, OAuth/IdP { error_description },
// FastAPI/STAC { detail: 'string' } / { message } / { description }. Returns
// undefined when nothing usable is there so callers can fall back to a
// canned message instead of rendering an empty toast.
function extractErrorMessage(detail: unknown): string | undefined {
  if (typeof detail === 'string') return detail || undefined;
  if (detail && typeof detail === 'object') {
    const d = detail as Record<string, unknown>;
    if (typeof d.error_description === 'string') return d.error_description;
    if (typeof d.message === 'string') return d.message;
    if (typeof d.detail === 'string') return d.detail;
    if (typeof d.description === 'string') return d.description;
  }
  return undefined;
}

export function parseResponseForNotifications(response: DetailResponse) {
  const detailObj = (
    response.detail && typeof response.detail === 'object'
      ? response.detail
      : {}
  ) as { detail?: { loc: string[]; msg: string }[] };

  if (response.status === 400 && Array.isArray(detailObj.detail)) {
    const notifications = detailObj.detail.reduce((acc, error, i) => {
      let p: string[] = error.loc.slice(1);
      const last = error.loc[error.loc.length - 1];

      if (last === 'float' || last === 'int') {
        p = p.slice(0, -1);
      }

      const path = p.join('.');

      return acc.has(path)
        ? acc
        : acc.set(path, {
            id: i,
            type: 'validation-error',
            path,
            message: error.msg
          });
    }, new Map<string, AppNotification>());

    return Array.from(notifications.values());
  }

  const serverMessage = extractErrorMessage(response.detail);

  if (response.status === 403) {
    return [
      {
        id: 0,
        type: 'error',
        title: 'Forbidden',
        message:
          serverMessage ?? 'You do not have permission to perform this action.'
      } as AppNotification
    ];
  }
  return [
    {
      id: 0,
      type: 'error',
      title: `Error ${response.status}`,
      message: serverMessage ?? `An error occurred: ${response.statusText}`
    } as AppNotification
  ];
}

interface NotificationButtonProps {
  notifications: AppNotification[];
}

// Imperative helpers. Callers fire these from event handlers / catch blocks
// so we never trigger Chakra's flushSync-based toaster from inside a React
// commit phase. Notification state still lives in the parent (for the bell
// badge); these just keep the toast in sync with whatever the caller just
// decided.
export function showNotificationsToast(notifications: AppNotification[]) {
  if (notifications.length === 0) {
    toaster.dismiss('notifications');
    return;
  }
  const meta = { kind: 'notifications' as const, notifications };
  if (toaster.isVisible('notifications')) {
    toaster.update('notifications', { meta });
  } else {
    toaster.create({
      id: 'notifications',
      duration: Number.POSITIVE_INFINITY,
      meta
    });
  }
}

export function hideNotificationsToast() {
  toaster.dismiss('notifications');
}

export function NotificationButton(props: NotificationButtonProps) {
  const { notifications } = props;

  return (
    <Button
      aria-label='Notifications'
      variant='outline'
      onClick={() => showNotificationsToast(notifications)}
    >
      <CollecticonBell />
      {!!notifications.length && (
        <Badge
          variant='solid'
          color='white'
          bg='base.400a'
          position='absolute'
          top='-0.5rem'
          right='-0.5rem'
          px={2}
        >
          {notifications.length < 10
            ? `0${notifications.length}`
            : notifications.length}
        </Badge>
      )}
    </Button>
  );
}

interface NotificationBoxProps {
  onCloseClick: () => void;
  notifications: AppNotification[];
}

export function NotificationBox(props: NotificationBoxProps) {
  const { onCloseClick, notifications } = props;
  return (
    <Box
      shadow='md'
      borderRadius='md'
      bg='surface.500'
      w='100%'
      overflow='hidden'
    >
      <Flex
        p={4}
        borderBottomWidth='1px'
        borderBottomStyle='solid'
        borderBottomColor='base.100'
        boxShadow='0 1px 0 0 rgba(0, 0, 0, 0.08)'
        position='relative'
        alignItems='center'
        gap={4}
      >
        <Heading size='xs'>Notifications</Heading>

        {!!notifications.length && (
          <Badge variant='solid' color='white' bg='base.400a' px={2}>
            {' '}
            {notifications.length < 10
              ? `0${notifications.length}`
              : notifications.length}
          </Badge>
        )}
        <IconButton
          aria-label='Close notifications'
          size='sm'
          variant='outline'
          onClick={onCloseClick}
          ml='auto'
        >
          <CollecticonXmarkSmall />
        </IconButton>
      </Flex>
      <Box overflowY='scroll' maxH='30rem'>
        {notifications.length ? (
          notifications.map((n) => <ErrorNotification key={n.id} {...n} />)
        ) : (
          <Flex height={20} alignItems='center' justifyContent='center' px={8}>
            Nothing to show besides this satellite 🛰️
          </Flex>
        )}
      </Box>
    </Box>
  );
}

function ErrorNotification(props: AppNotification) {
  const { message, title } = props;

  return (
    <Flex boxShadow='0 -1px 0 0 rgba(0, 0, 0, 0.08)' position='relative'>
      <Flex bg='danger.200' p={4}>
        <CollecticonCircleExclamation color='danger.500' />
      </Flex>
      <Box p={4}>
        <Text fontWeight='bold' mb={2}>
          {title ||
            (props.type === 'validation-error' ? 'Validation error' : 'Error')}
        </Text>
        {props.type === 'validation-error' && (
          <>
            <Text as='span' fontWeight='bold'>
              At:
            </Text>{' '}
            <Text as='span' fontStyle='italic'>
              {props.path}
            </Text>
            <br />
          </>
        )}
        <Text>{message}</Text>
      </Box>
    </Flex>
  );
}
