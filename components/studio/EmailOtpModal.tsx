"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Mail, KeyRound, Clock, RefreshCw, CheckCircle2, Loader2, ShieldCheck, Sparkles, Inbox, Copy, Check } from "lucide-react";

interface EmailOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (verifiedEmail: string) => void;
}

export function EmailOtpModal({ isOpen, onClose, onVerified }: EmailOtpModalProps) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [backupCode, setBackupCode] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 5-minute countdown timer effect
  useEffect(() => {
    if (step !== "otp" || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Reset state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep("email");
      setEmail("");
      setOtpCode("");
      setBackupCode(null);
      setError(null);
      setSuccessMessage(null);
      setTimeLeft(300);
    }
  }, [isOpen]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

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

      if (data.devCode) {
        setBackupCode(data.devCode);
        setOtpCode(data.devCode); // Auto-fill for seamless user experience!
        setSuccessMessage(`SMTP notice: Test verification code is ${data.devCode}.`);
      } else {
        setSuccessMessage(data.message || `6-digit code sent to ${email}. Check your email inbox.`);
      }
      setTimeLeft(300);
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

      if (data.devCode) {
        setBackupCode(data.devCode);
        setOtpCode(data.devCode);
        setSuccessMessage(`Test verification code is ${data.devCode}.`);
      } else {
        setSuccessMessage(`New 6-digit code sent to ${email}. Check your email inbox.`);
      }
      setTimeLeft(300);
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

      if (data.verifiedToken && typeof window !== "undefined") {
        localStorage.setItem("zm_verified_token", data.verifiedToken);
        localStorage.setItem("zm_verified_email", data.verifiedEmail);
      }
      onVerified(data.verifiedEmail);
      onClose();
    } catch (err: any) {
      setError(err.message || "Code verification failed.");
    } finally {
      setIsVerifying(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-7 sm:p-8 rounded-3xl bg-white border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col gap-5 text-stone-900">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-[10px] font-mono font-bold uppercase tracking-widest w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-stone-600" /> Identity Verification
          </div>
          <h2 className="text-2xl font-serif font-bold text-stone-900">
            {step === "email" ? "Verify Email to Generate" : "Enter 6-Digit Code"}
          </h2>
          <p className="text-xs text-stone-500 leading-relaxed">
            {step === "email"
              ? "Verify your email to enter the AI Mosaic Surface generation phase."
              : `Enter the verification code for ${email} to proceed.`}
          </p>
        </div>

        {/* Mailbox notification or Backup code banner */}
        {step === "otp" && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-stone-600 flex-shrink-0" />
              <span className="font-semibold text-stone-900">
                {backupCode ? "Direct Verification Code Ready" : "Check Your Mailbox"}
              </span>
            </div>
            {backupCode ? (
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-200">
                <span className="font-mono font-bold text-base tracking-widest text-stone-900">
                  {backupCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(backupCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Auto-filled" : "Use Code"}
                </button>
              </div>
            ) : (
              <span className="text-[11px] text-stone-500">
                A 6-digit code has been dispatched to <strong className="text-stone-800 font-mono">{email}</strong>.
              </span>
            )}
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-500" /> Client Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="architect@firm.com"
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 focus:bg-white transition-all"
              />
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">{error}</div>}

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3.5 px-6 rounded-xl font-medium text-xs bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Send 6-Digit Code to Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-stone-500" /> 6-Digit Verification Code
                </label>
                <span className="text-xs font-mono font-bold text-stone-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-stone-400" /> {formatTimer(timeLeft)}
                </span>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-center font-mono font-bold text-xl text-stone-900 tracking-[0.4em] focus:outline-none focus:border-stone-800 focus:bg-white transition-all"
              />
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">{error}</div>}
            {successMessage && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">{successMessage}</div>}

            <button
              type="submit"
              disabled={isVerifying || timeLeft <= 0}
              className="w-full py-3.5 px-6 rounded-xl font-medium text-xs bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Verify Code & Enter AI Image Generation Phase
            </button>

            <div className="flex justify-between items-center text-xs pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="text-stone-500 hover:text-stone-900 transition-colors font-medium"
              >
                ← Change Email
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSending}
                className="text-stone-700 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <RefreshCw className="w-3 h-3" /> Resend New Code
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
