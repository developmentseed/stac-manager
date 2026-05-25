import React, { forwardRef } from 'react';
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

export const Fieldset = forwardRef<HTMLDivElement, FlexProps>((props, ref) => {
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

export const FieldsetHeader = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    return <Flex ref={ref} justifyContent='space-between' gap={4} {...props} />;
  }
);

export const FieldsetBody = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    return <Flex ref={ref} flexDirection='column' gap={4} {...props} />;
  }
);

export const FieldsetFooter = forwardRef<HTMLDivElement, FlexProps>(
  (props, ref) => {
    return <Flex ref={ref} gap={4} {...props} />;
  }
);

export const FieldLabel = forwardRef<HTMLHeadingElement, HeadingProps>(
  (props, ref) => {
    return (
      <Heading
        ref={ref}
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
);

export const FieldIconBtn = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    return (
      <IconButton
        ref={ref}
        colorPalette='base'
        variant={'soft-outline' as 'outline'}
        size='xs'
        {...props}
      />
    );
  }
);

export const FieldsetDeleteBtn = forwardRef<HTMLButtonElement, IconButtonProps>(
  (props, ref) => {
    return (
      <FieldIconBtn ref={ref} size='sm' aria-label='Delete' {...props}>
        <CollecticonTrashBin />
      </FieldIconBtn>
    );
  }
);

Fieldset.displayName = 'Fieldset';
FieldsetHeader.displayName = 'FieldsetHeader';
FieldsetBody.displayName = 'FieldsetBody';
FieldsetFooter.displayName = 'FieldsetFooter';
FieldLabel.displayName = 'FieldLabel';
FieldIconBtn.displayName = 'FieldIconBtn';
FieldsetDeleteBtn.displayName = 'FieldsetDeleteBtn';

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
