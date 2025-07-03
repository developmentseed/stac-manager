import {
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Text,
  useToast
} from '@chakra-ui/react';
import {
  CollecticonBell,
  CollecticonCircleExclamation,
  CollecticonXmarkSmall
} from '@devseed-ui/collecticons-chakra';
import React, { useEffect } from 'react';

interface DetailResponse {
  status: number;
  statusText: string;
  detail: {
    detail: { loc: string[]; msg: string }[];
    body: any;
  };
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

export function parseResponseForNotifications(response: DetailResponse) {
  if (response.status === 400 && response.detail.detail) {
    const notifications = response.detail.detail.reduce((acc, error, i) => {
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
  } else if (response.status === 403) {
    return [
      {
        id: 0,
        type: 'error',
        title: 'Forbidden',
        message: 'You do not have permission to perform this action.'
      } as AppNotification
    ];
  }
  return [
    {
      id: 0,
      type: 'error',
      title: `Error ${response.status}`,
      message: 'An error occurred: ' + response.statusText
    } as AppNotification
  ];
}

interface NotificationButtonProps {
  notifications: AppNotification[];
}

function useNotificationsToast(notifications: AppNotification[]) {
  const toast = useToast();

  const show = () => {
    if (!toast.isActive('notifications')) {
      toast({
        id: 'notifications',
        position: 'bottom-right',
        duration: null,
        render: () => (
          <NotificationBox
            notifications={notifications}
            onCloseClick={() => {
              toast.close('notifications');
            }}
          />
        )
      });
    }
  };

  useEffect(() => {
    if (notifications.length !== 0) {
      show();
    } else {
      toast.close('notifications');
    }
  }, [notifications.length]);

  return {
    show,
    hide: () => {
      toast.close('notifications');
    }
  };
}

export function NotificationButton(props: NotificationButtonProps) {
  const { notifications } = props;

  const toast = useNotificationsToast(notifications);

  return (
    <Button
      aria-label='Notifications'
      variant='outline'
      onClick={() => {
        toast.show();
      }}
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
      w={80}
      overflow='hidden'
    >
      <Flex
        p={4}
        borderBottom='1px solid'
        borderColor='base.100'
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
          icon={<CollecticonXmarkSmall />}
          aria-label='Close notifications'
          size='sm'
          variant='outline'
          onClick={onCloseClick}
          ml='auto'
        />
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
          {title || props.type === 'validation-error'
            ? 'Validation error'
            : 'Error'}
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
