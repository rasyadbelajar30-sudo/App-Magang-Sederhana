import React, { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

export function AnimatedNumber({ value = 0, suffix = '', prefix = '', className = '' }) {
  const numericValue = Number(value) || 0;
  const springValue = useSpring(numericValue, {
    stiffness: 120,
    damping: 20,
  });
  const [display, setDisplay] = useState(Math.round(numericValue));

  useEffect(() => {
    springValue.set(numericValue);
  }, [numericValue, springValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplay(Math.round(latest));
    });
    return () => unsubscribe();
  }, [springValue]);

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
