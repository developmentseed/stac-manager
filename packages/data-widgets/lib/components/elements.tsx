import React from 'react';
import {
  Box,
  Flex,
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

export function Fieldset(props: FlexProps) {
  return (
    <Flex
      as='fieldset'
      flexDirection='column'
      gap={8}
      p={4}
      bg='base.50a'
      borderRadius='md'
      {...props}
    />
  );
}

export function FieldsetHeader(props: FlexProps) {
  return <Flex justifyContent='space-between' gap={4} {...props} />;
}

export function FieldsetBody(props: FlexProps) {
  return <Flex flexDirection='column' gap={4} {...props} />;
}

export function FieldsetFooter(props: FlexProps) {
  return <Flex gap={4} {...props} />;
}

export function FieldLabel(props: HeadingProps) {
  return (
    <Heading
      as='span'
      size='sm'
      display='inline-flex'
      alignItems='center'
      gap={2}
      {...props}
      css={{
        '& small': {
          borderRadius: 'sm',
          bg: 'base.400a',
          color: 'surface.500',
          px: '0.5rem',
          fontSize: 'xs'
        }
      }}
    />
  );
}

export function FieldIconBtn(props: IconButtonProps) {
  return (
    <IconButton
      colorPalette='base'
      variant={'soft-outline' as 'outline'}
      size='xs'
      {...props}
    />
  );
}

export function FieldsetDeleteBtn(props: IconButtonProps) {
  return (
    <FieldIconBtn size='sm' aria-label='Delete' {...props}>
      <CollecticonTrashBin />
    </FieldIconBtn>
  );
}

interface ArrayFieldsetProps {
  label?: React.ReactNode;
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
                disabled={removeDisabled}
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
            colorPalette='base'
            size='sm'
            onClick={onAdd}
            aria-label='Add item'
            disabled={addDisabled}
          >
            <CollecticonPlusSmall />
            Add another
          </Button>
        </FieldsetFooter>
      )}
    </Fieldset>
  );
}
