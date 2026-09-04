import React from "react";
import Link from "next/link";
import { CheckCircle2, ArrowLeft, PhoneCall, Sparkles } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-lg animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight">
          Inquiry Received!
        </h1>

        <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
          Thank you for reaching out to us. Your custom surface inquiry has been recorded and an email notification has been dispatched to our design team.
        </p>

        <div className="my-8 p-4 rounded-2xl bg-muted/30 border border-border text-xs text-left space-y-2">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Sparkles className="w-4 h-4 text-primary" /> What happens next?
          </div>
          <p className="text-muted-foreground">
            Our specialist will review your space dimensions, material preferences, and design mockups, then prepare a tailored estimate within 24 business hours.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Home
          </Link>
          <a
            href="tel:+18005550199"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium transition-all hover:bg-secondary/80 border border-border"
          >
            <PhoneCall className="w-4 h-4" /> Call Specialist
          </a>
        </div>
      </div>
    </div>
  );
}
