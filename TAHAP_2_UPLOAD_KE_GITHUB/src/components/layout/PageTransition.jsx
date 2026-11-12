import React from 'react';

export function PageTransition({ children, className = '' }) {
  return <div className={`animate-page-enter ${className}`}>{children}</div>;
}
