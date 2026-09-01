"use client";

import React, { useState } from "react";
import { X, PhoneCall, Calendar, MessageSquare, Send, CheckCircle2, Loader2, User, Mail } from "lucide-react";
import Image from "next/image";

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    resultImageUrl?: string;
    prompt?: string;
    placement?: string;
    estimatedCost?: number;
  };
}

export function SpecialistModal({ isOpen, onClose, initialData }: SpecialistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferredTime, setPreferredTime] = useState("Morning (9 AM - 12 PM EST)");
  const [message, setMessage] = useState(
    initialData?.prompt
      ? `Would like a direct phone consultation with a surface specialist regarding ${initialData.placement || "mosaic design"}: "${initialData.prompt}".`
      : "I would like to speak directly with an Italian marble & surface specialist about my project specifications."
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !message) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryType: "TALK_TO_SPECIALIST",
          name,
          email,
          phone,
          preferredTime,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to request consultation.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl p-8 rounded-3xl bg-obsidian-900 border border-gold-500/30 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center shadow-xl shadow-gold-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">Consultation Scheduled</h3>
            <p className="text-xs text-neutral-300 max-w-md">
              Our master surface specialist will contact you at your preferred time to review your architectural plans.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-1">
                <PhoneCall className="w-3.5 h-3.5" /> Specialist Consultation
              </div>
              <h3 className="text-2xl font-serif font-bold text-white">Talk to a Surface Specialist</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Direct phone consultation with our Italian marble & waterjet engineering team.
              </p>
            </div>

            {initialData?.resultImageUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-700">
                  <Image src={initialData.resultImageUrl} alt="Design preview" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Attached Surface Render</p>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{initialData.prompt}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-gold-400" /> Full Name / Firm
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aurelia Vance"
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gold-400" /> Professional Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@firm.com"
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-gold-400" /> Direct Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gold-400" /> Preferred Call Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white focus:outline-none focus:border-gold-400 transition-all"
                  >
                    <option value="Morning (9 AM - 12 PM EST)">Morning (9 AM - 12 PM EST)</option>
                    <option value="Afternoon (12 PM - 4 PM EST)">Afternoon (12 PM - 4 PM EST)</option>
                    <option value="Evening (4 PM - 7 PM EST)">Evening (4 PM - 7 PM EST)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-medium text-neutral-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" /> Call Topics / Project Specs
                </label>
                <textarea
                  rows={2}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none"
                />
              </div>
            </div>

            {error && <div className="text-xs text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-500/20">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Booking Call...
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" /> Schedule Phone Call with Specialist
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
