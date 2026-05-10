'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -10, transition: { duration: 0.10 } }}
        className="min-h-full"
      >
        <AnimatePresence mode="wait">
          {/* Loading Screen */}
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.50 }}
              className="min-h-[70vh] flex items-center justify-center"
            >
              <div className="w-9 h-9 border-4 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
            </motion.div>
          ) : (
            /* Content - Starts from bottom and slides up */
            <motion.div
              initial={{ opacity: 0, y: 20 }}     // Start lower
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 2,                    // Slow & smooth
                ease: [0.22, 1, 0.36, 1],         // Premium easing
              }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}