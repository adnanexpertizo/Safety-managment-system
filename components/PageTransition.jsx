'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1], // cubic-bezier "ease"
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.15,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

export default function PageTransition({ children }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}