import React from 'react';
import {
  Box,
  Flex,
  forwardRef,
  Heading,
  IconButton,
  Button,
  HeadingProps,
  IconButtonProps,
  FlexProps,
  Text
} from '@chakra-ui/react';
import {
  CollecticonTrashBin,
  CollecticonPlusSmall
} from '@devseed-ui/collecticons-chakra';

export const Fieldset = forwardRef<FlexProps, 'div'>((props, ref) => {
  return (
    <Flex
      ref={ref}
      as='fieldset'
      flexDirection='column'
      gap={8}
      p={4}
      bg='base.50a'
      borderRadius='md'
      {...props}
    />
  );
});

export const FieldsetHeader = forwardRef<FlexProps, 'div'>((props, ref) => {
  return <Flex ref={ref} justifyContent='space-between' gap={4} {...props} />;
});

export const FieldsetBody = forwardRef<FlexProps, 'div'>((props, ref) => {
  return <Flex ref={ref} flexDirection='column' gap={4} {...props} />;
});

export const FieldsetFooter = forwardRef<FlexProps, 'div'>((props, ref) => {
  return <Flex ref={ref} gap={4} {...props} />;
});

export const FieldLabel = forwardRef<HeadingProps, 'span'>((props, ref) => {
  return (
    <Heading
      ref={ref}
      as='span'
      size='sm'
      display='inline-flex'
      alignItems='center'
      gap={2}
      {...props}
      sx={{
        ...(props?.sx ?? {}),
        small: {
          borderRadius: 'sm',
          bg: 'base.400a',
          color: 'surface.500',
          px: '0.5rem',
          fontSize: 'xs'
        }
      }}
    />
  );
});

export const FieldIconBtn = forwardRef<IconButtonProps, 'button'>(
  (props, ref) => {
    return (
      <IconButton
        ref={ref}
        colorScheme='base'
        variant='soft-outline'
        size='xs'
        {...props}
      />
    );
  }
);

export const FieldsetDeleteBtn = forwardRef<IconButtonProps, 'button'>(
  (props, ref) => {
    return (
      <FieldIconBtn
        ref={ref}
        size='sm'
        icon={<CollecticonTrashBin />}
        {...props}
      />
    );
  }
);

interface ArrayFieldsetProps {
  label: React.ReactNode;
  isRequired?: boolean;
  children: React.ReactNode;
  onRemove?: () => void;
  onAdd?: () => void;
  addDisabled?: boolean;
  removeDisabled?: boolean;
}

export function ArrayFieldset(props: ArrayFieldsetProps) {
  const {
    label,
    isRequired,
    children,
    onRemove,
    onAdd,
    addDisabled,
    removeDisabled
  } = props;

  return (
    <Fieldset className='widget--array'>
      {(label || onRemove) && (
        <FieldsetHeader>
          {label && (
            <Box>
              <FieldLabel>
                {label}
                {isRequired && (
                  <Text
                    as='span'
                    color='danger.500'
                    role='presentation'
                    aria-hidden='true'
                  >
                    *
                  </Text>
                )}
              </FieldLabel>
            </Box>
          )}
          {onRemove && (
            <Box>
              <FieldsetDeleteBtn
                onClick={onRemove}
                isDisabled={removeDisabled}
                aria-label='Remove item'
              />
            </Box>
          )}
        </FieldsetHeader>
      )}
      <FieldsetBody>{children}</FieldsetBody>
      {onAdd && (
        <FieldsetFooter>
          <Button
            colorScheme='base'
            size='sm'
            onClick={onAdd}
            aria-label='Add item'
            leftIcon={<CollecticonPlusSmall />}
            isDisabled={addDisabled}
          >
            Add another
          </Button>
        </FieldsetFooter>
      )}
    </Fieldset>
  );
}
