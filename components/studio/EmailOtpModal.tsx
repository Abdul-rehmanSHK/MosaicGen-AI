"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, KeyRound, Clock, RefreshCw, CheckCircle2, Loader2, ShieldCheck, Sparkles, Inbox } from "lucide-react";

interface EmailOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedEmail: string) => void;
}

export function EmailOtpModal({ isOpen, onClose, onVerified }: EmailOtpModalProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/ai/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send verification code.");

      setSuccessMessage(data.message || `6-digit code sent to ${email}. Check your email mailbox.`);
      setTimeLeft(300); // Reset 5 min timer
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "Failed to send OTP code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleResendCode = async () => {
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/ai/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend", email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend code.");

      setSuccessMessage(`New 6-digit code sent to ${email}. Check your email inbox.`);
      setTimeLeft(300);
      setOtpCode("");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    if (timeLeft <= 0) {
      setError("Verification code has expired. Please click 'Resend New Code'.");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");

      // Success -> Enter AI image generation phase
      onVerified(data.verifiedEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || "Code verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-obsidian-900 border border-gold-500/40 shadow-2xl overflow-hidden flex flex-col gap-6">
        {/* Glow accent */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-obsidian-800 text-neutral-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-[10px] font-mono font-bold uppercase tracking-widest w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> Identity Verification
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">
            {step === "email" ? "Verify Email to Generate" : "Enter 6-Digit Code"}
          </h2>
          <p className="text-xs text-neutral-400">
            {step === "email"
              ? "Verify your email to enter the AI Mosaic Surface generation phase."
              : `We sent a 6-digit verification code to ${email}. Please check your email mailbox.`}
          </p>
        </div>

        {/* Mailbox notification banner */}
        {step === "otp" && (
          <div className="p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-xs text-gold-300 flex items-center gap-2.5">
            <Inbox className="w-5 h-5 text-gold-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-bold text-white">Check Your Mailbox</span>
              <span className="text-[11px] text-neutral-300">
                A 6-digit code has been dispatched to <strong className="text-gold-300 font-mono">{email}</strong>. Code expires in 5 minutes.
              </span>
            </div>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold-400" /> Client Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@firm.com"
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>

            {error && <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300">{error}</div>}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Send 6-Digit Code to Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-gold-400" /> 6-Digit Verification Code
                </label>
                <span className="text-xs font-mono font-bold text-gold-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gold-400" /> {formatTimer(timeLeft)}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full p-3.5 rounded-xl bg-obsidian-950 border border-neutral-800 text-center font-mono font-bold text-lg text-gold-300 tracking-[0.4em] focus:outline-none focus:border-gold-400 transition-all"
              />
            </div>

            {error && <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-xs text-red-300">{error}</div>}
            {successMessage && <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">{successMessage}</div>}

            <button
              type="submit"
              disabled={isVerifying || timeLeft <= 0}
              className="w-full py-3.5 px-6 rounded-xl font-serif font-bold text-xs bg-gold-500 hover:bg-gold-400 text-obsidian-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:opacity-50"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Verify Code & Enter AI Image Generation Phase
            </button>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSending}
                className="text-gold-300 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" /> Resend New Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
