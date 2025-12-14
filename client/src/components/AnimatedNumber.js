import React, { useEffect, useRef, useState } from 'react';

// Lightweight animated number component with requestAnimationFrame
export default function AnimatedNumber({ value, format = (v) => v.toFixed(2), className = '' }) {
  const ref = useRef({ current: value });
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = ref.current.current;
    const end = value;
    const duration = 500;
    const startTime = performance.now();

    cancelAnimationFrame(rafRef.current);

    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = start + (end - start) * eased;
      setDisplay(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        ref.current.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return (
    <span className={`num-anim ${className}`}>
      {format(display)}
    </span>
  );
}
