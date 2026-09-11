"use client";

import React from "react";
import { motion } from "framer-motion";

export function HeroReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateX: 20, y: 30, scale: 0.95, filter: "blur(12px)" }}
      animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: "1200px" }}
      className="w-full flex flex-col items-center justify-center gap-7 relative z-10"
    >
      {children}
    </motion.div>
  );
}
