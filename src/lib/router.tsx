import { useEffect, useState, useCallback } from 'react';

export interface Route {
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [pathPart, queryPart] = hash.split('?');
  const path = pathPart || '/';
  const query = new URLSearchParams(queryPart || '');
  return { path, params: {}, query };
}

export function useRouter() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { route, navigate };
}

export function matchRoute(
  path: string,
  pattern: string
): Record<string, string> | null {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function Link({
  to,
  children,
  className,
  onClick,
  style,
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <a
      href={`#${to}`}
      className={className}
      style={style}
      onClick={(e) => {
        e.preventDefault();
        window.location.hash = to;
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}
