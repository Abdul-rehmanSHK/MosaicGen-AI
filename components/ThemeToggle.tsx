"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-obsidian-900 dark:bg-obsidian-900 light:bg-amber-100/80 border border-gold-500/30 text-gold-400 hover:text-gold-300 hover:border-gold-400 transition-all duration-300 shadow-md group flex items-center justify-center"
      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Luxury Mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-gold-300 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-amber-700 group-hover:-rotate-12 transition-transform duration-300" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </button>
  );
}
