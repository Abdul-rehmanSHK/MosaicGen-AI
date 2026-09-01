"use client";

import React, { useState } from "react";
import { X, Send, CheckCircle2, Loader2, Mail, User as UserIcon, MessageSquare } from "lucide-react";
import Image from "next/image";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    productId?: string;
    generationId?: string;
    resultImageUrl?: string;
    prompt?: string;
    placement?: string;
    estimatedCost?: number;
  };
}

export function InquiryModal({ isOpen, onClose, initialData }: InquiryModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(
    initialData?.prompt
      ? `Requesting material sample box & quote for ${initialData.placement || "mosaic design"}: "${initialData.prompt}".`
      : "I am interested in ordering a bespoke mosaic surface sample box and receiving an architect quote."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          productId: initialData?.productId,
          generationId: initialData?.generationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry.");
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
        {/* Background glow accent */}
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
            <h3 className="text-2xl font-serif font-bold text-white">Inquiry Received</h3>
            <p className="text-xs text-neutral-300 max-w-md">
              Thank you! Our master architectural design team will inspect your specs and dispatch your complimentary luxury sample box.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <span className="text-xs text-gold-400 uppercase font-semibold tracking-widest block mb-1">
                Architectural Lead Inquiry
              </span>
              <h3 className="text-2xl font-serif font-bold text-white">Request Quote & Sample Box</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Receive physical mesh sample tesserae and complete architectural cost breakdown.
              </p>
            </div>

            {initialData?.resultImageUrl && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-obsidian-950 border border-neutral-800">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-neutral-700">
                  <Image src={initialData.resultImageUrl} alt="Design preview" fill className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Attached AI Mosaic Design</p>
                  <p className="text-[11px] text-neutral-400 line-clamp-1">{initialData.prompt}</p>
                  {initialData.estimatedCost && (
                    <p className="text-[11px] text-gold-400 font-serif font-bold mt-0.5">
                      Est. Cost: ${initialData.estimatedCost.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-gold-400" /> Full Name / Firm
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aurelia Vance (Vance Architects)"
                  className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gold-400" /> Professional Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="architect@firm.com"
                  className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" /> Project Details & Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all resize-none"
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Architectural Quote Request
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
