import React from 'react';

export const Link = ({ to, children, ...props }: any) => {
  const normalize = (path: string) => {
    if (!path.startsWith('/') || path.includes('://')) return path;
    const [base, ...rest] = path.split(/([?#])/);
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return normalizedBase + rest.join('');
  };
    
  const href = typeof to === 'string' ? normalize(to) : to;
    
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
};

export const useAstroNavigate = () => {
  return (to: string | number) => {
    if (typeof to === 'number') {
      window.history.go(to);
    } else {
      const normalize = (path: string) => {
        if (!path.startsWith('/') || path.includes('://')) return path;
        const [base, ...rest] = path.split(/([?#])/);
        const normalizedBase = base.endsWith('/') ? base : `${base}/`;
        return normalizedBase + rest.join('');
      };
      const target = normalize(to);

      // Astro View Transitions intercepts <a> clicks — dispatch a real anchor click
      // so the router picks it up and does a smooth transition instead of a hard reload.
      const a = document.createElement('a');
      a.href = target;
      a.style.display = 'none';
      if (document.body) {
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        window.location.href = target;
      }
    }
  };
};
