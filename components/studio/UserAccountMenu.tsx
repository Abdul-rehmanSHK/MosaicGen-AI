"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layers, Mail, Sparkles, ChevronDown } from "lucide-react";
import { MyGenerationsModal } from "./MyGenerationsModal";

interface UserAccountMenuProps {
  email: string;
  onUseDifferentEmail: () => void;
  onSelectGeneration?: (gen: any) => void;
  refreshTrigger?: number;
}

export function UserAccountMenu({
  email,
  onUseDifferentEmail,
  onSelectGeneration,
  refreshTrigger = 0,
}: UserAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [usedCount, setUsedCount] = useState(0);
  const maxLimit = 5;
  const menuRef = useRef<HTMLDivElement>(null);

  // Derive initials from email (e.g. "abdd6965@gmail.com" -> "AB")
  const localPart = email.split("@")[0] || "U";
  const initials = localPart.slice(0, 2).toUpperCase();

  // Fetch current usage count
  useEffect(() => {
    if (!email) return;

    fetch(`/api/ai/my-generations?email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.usedCount === "number") {
          setUsedCount(data.usedCount);
        }
      })
      .catch(() => {});
  }, [email, refreshTrigger]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const remaining = Math.max(0, maxLimit - usedCount);
  const progressPercent = Math.min(100, Math.round((usedCount / maxLimit) * 100));

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Avatar Circle Trigger Button (like "AB" in screenshot) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-obsidian-800 hover:bg-obsidian-700 border border-gold-500/40 text-gold-300 font-serif font-bold text-xs sm:text-sm flex items-center justify-center transition-all shadow-md hover:border-gold-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500/30"
        title={`Signed in as ${email}`}
      >
        {initials}
      </button>

      {/* Popover Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl shadow-black/80 backdrop-blur-2xl p-5 z-50 flex flex-col gap-4 animate-fadeIn">
          {/* Top Section: Signed In As */}
          <div className="flex flex-col gap-0.5 border-b border-neutral-800 pb-3">
            <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase font-bold">
              SIGNED IN AS
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate">
              {email}
            </span>
          </div>

          {/* Quota Progress: Free Previews (e.g. 3 / 5) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-neutral-300">
                FREE PREVIEWS
              </span>
              <span className="text-xs font-mono font-bold text-gold-300">
                {usedCount} / {maxLimit}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-obsidian-950 border border-neutral-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span className="text-[11px] text-neutral-400">
              {remaining > 0 ? `${remaining} previews remaining.` : "0 previews remaining (Limit reached)."}
            </span>
          </div>

          {/* Action Links */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-neutral-800">
            {/* My Generations */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsHistoryModalOpen(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-obsidian-950/60 hover:bg-obsidian-800 text-neutral-200 hover:text-gold-300 text-xs font-semibold flex items-center gap-2.5 transition-all border border-neutral-800/80 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-gold-400" />
              <span>My generations</span>
            </button>

            {/* Use a Different Email */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onUseDifferentEmail();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-obsidian-950/60 hover:bg-obsidian-800 text-neutral-400 hover:text-white text-[11px] font-mono uppercase tracking-wider flex items-center gap-2.5 transition-all border border-neutral-800/80 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-400" />
              <span>USE A DIFFERENT EMAIL</span>
            </button>
          </div>
        </div>
      )}

      {/* My Generations Modal */}
      <MyGenerationsModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        email={email}
        onSelectGeneration={(gen) => {
          if (onSelectGeneration) {
            onSelectGeneration(gen);
          } else if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("zm_select_generation", { detail: gen }));
          }
        }}
        onUseDifferentEmail={onUseDifferentEmail}
      />
    </div>
  );
}
