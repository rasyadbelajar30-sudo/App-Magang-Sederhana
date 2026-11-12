import React from 'react';

export function GlassCard({
  children,
  className = '',
  as: Component = 'div',
  hoverLift = false,
  ...props
}) {
  const { layout: _layout, ...restProps } = props;
  return (
    <Component
      className={`bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800/90 rounded-3xl shadow-[0_10px_30px_-10px_rgba(15,23,42,0.12)] dark:shadow-[0_14px_34px_-12px_rgba(0,0,0,0.45)] transition-all duration-300 hover:shadow-[0_18px_38px_-12px_rgba(79,70,229,0.18)] ${
        hoverLift ? 'hover:-translate-y-1' : ''
      } ${className}`}
      {...restProps}
    >
      {children}
    </Component>
  );
}
