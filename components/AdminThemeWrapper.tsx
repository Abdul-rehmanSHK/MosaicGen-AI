"use client";

import React from "react";
import { useTheme } from "./ThemeProvider";

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors ${theme === "dark" ? "dark bg-obsidian-950 text-white" : "light bg-[#FAF8F5] text-[#171922]"}`}>
      {children}
    </div>
  );
}
