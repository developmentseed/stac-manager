import React from 'react';
import { Link as ChLink, LinkProps } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export interface SmartLinkProps extends LinkProps {
  to: string;
}

export default React.forwardRef<HTMLLinkElement, SmartLinkProps>(
  function SmartLink(props, ref) {
    const { to, ...rest } = props;

    const isExternal =
      to.match(/^(https?:)?\/\//) || to.match(/^(mailto|tel):/);

    return isExternal ? (
      <ChLink ref={ref} href={to} {...rest} />
    ) : (
      <ChLink ref={ref} as={Link} to={to} {...rest} />
    );
  }
);
