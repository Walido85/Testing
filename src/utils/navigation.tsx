import React from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

export const Link = ({ to, children, onClick, className, style, ...props }: any) => {
  const href = to || '/';
  return (
    <NextLink href={href} onClick={onClick} className={className} style={style} {...props}>
      {children}
    </NextLink>
  );
};

export const useAstroNavigate = () => {
  const router = useRouter();
  return (to: string | number) => {
    if (typeof to === 'number') {
      if (to === -1) router.back();
      else window.history.go(to);
    } else {
      router.push(to);
    }
  };
};
