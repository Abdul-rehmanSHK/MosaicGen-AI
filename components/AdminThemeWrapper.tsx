"use client";

import React from "react";

export function AdminThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-light-theme min-h-screen md:h-screen md:max-h-screen md:overflow-hidden flex flex-col md:flex-row bg-[#f4f3f2] text-stone-900">
      {children}
    </div>
  );
}
