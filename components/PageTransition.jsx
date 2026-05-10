'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

const variants = {

  enter: { 
    opacity: 1, 
    y:  5,
    transition: { 
      duration: 0.45, 
      ease: "easeOut" 
    } 
  },
  exit: { 
    opacity: 0.6, 
    y: 0,
    transition: { 
      duration: 0.9 
    } 
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