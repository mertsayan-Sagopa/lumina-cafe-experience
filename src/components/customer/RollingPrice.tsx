"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface RollingPriceProps {
  value: number;
  className?: string;
}

/**
 * Displays a price that transitions to the new amount with a smooth
 * 1-second downward sliding animation whenever items are added or changed.
 */
export default function RollingPrice({
  value,
  className = "",
}: RollingPriceProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [animKey, setAnimKey] = useState(0);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      prevRef.current = value;
      setDisplayValue(value);
      setAnimKey((k) => k + 1);
    }
  }, [value]);

  const formatted = `${displayValue.toLocaleString("tr-TR")} ₺`;

  return (
    <span
      className={`relative inline-flex h-[1.35em] items-center overflow-hidden align-middle ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={animKey}
          initial={{ y: "-115%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "115%", opacity: 0 }}
          transition={{
            duration: 1.0,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block whitespace-nowrap tabular-nums"
        >
          {formatted}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
