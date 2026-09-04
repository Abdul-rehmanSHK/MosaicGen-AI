"use client";

import React, { useTransition, useState } from "react";
import { motion } from "framer-motion";
import { submitInquiry, ActionState } from "@/app/actions/submitInquiry";
import {
  User,
  Mail,
  Phone,
  Layers,
  Ruler,
  MessageSquare,
  Send,
  Loader2,
  AlertCircle,
  ImageIcon,
} from "lucide-react";

interface InquiryFormProps {
  initialDesignImageUrl?: string;
  className?: string;
}

export default function InquiryForm({
  initialDesignImageUrl = "",
  className = "",
}: InquiryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionState>({});
  const [designImageUrl] = useState<string>(initialDesignImageUrl);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await submitInquiry(state, formData);
      if (result?.error) {
        setState(result);
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-2xl mx-auto bg-card border border-border text-card-foreground shadow-2xl rounded-3xl p-6 sm:p-10 backdrop-blur-xl ${className}`}
    >
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif text-foreground">
          Request a Custom Consultation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground font-light">
          Fill out the inquiry form below. Our architectural surface design team will contact you within 24 hours.
        </p>
      </div>

      {state.error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-start gap-3 text-sm shadow-sm"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Error</p>
            <p className="mt-0.5 opacity-90">{state.error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden Input for designImageUrl */}
        <input type="hidden" name="designImageUrl" value={designImageUrl} />

        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Full Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Eleanor Vance"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" /> Email Address <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="eleanor@example.com"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 shadow-sm"
            />
          </div>
        </div>

        {/* Row 2: Phone & Space Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="spaceType" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" /> Space / Surface Type <span className="text-destructive">*</span>
            </label>
            <select
              id="spaceType"
              name="spaceType"
              required
              defaultValue="Grand Foyer / Living Room"
              className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            >
              <option value="Grand Foyer / Living Room">Grand Foyer / Living Room</option>
              <option value="Kitchen Backsplash & Wall">Kitchen Backsplash & Wall</option>
              <option value="Luxury Bathroom & Shower">Luxury Bathroom & Shower</option>
              <option value="Pool Inlay & Outdoor Accent">Pool Inlay & Outdoor Accent</option>
              <option value="Commercial Lobby & Hospitality">Commercial Lobby & Hospitality</option>
              <option value="Other Custom Mosaic Surface">Other Custom Mosaic Surface</option>
            </select>
          </div>
        </div>

        {/* Row 3: Dimensions */}
        <div className="space-y-2">
          <label htmlFor="dimensions" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-primary" /> Approximate Dimensions / Area
          </label>
          <input
            id="dimensions"
            name="dimensions"
            type="text"
            placeholder="e.g. 12ft x 15ft (approx. 180 sq ft)"
            className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 shadow-sm"
          />
        </div>

        {/* Optional Image URL Preview Link */}
        {designImageUrl && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate pr-2">
              <ImageIcon className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium text-foreground truncate">Attached AI Design Mockup</span>
            </div>
            <a
              href={designImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline shrink-0"
            >
              Preview Link
            </a>
          </div>
        )}

        {/* Row 4: Message */}
        <div className="space-y-2">
          <label htmlFor="message" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-primary" /> Project Vision / Message <span className="text-destructive">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="Tell us about your project, material preferences (marble, glass, waterjet), or timeline..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/60 shadow-sm resize-none"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="submit"
          disabled={isPending}
          className="w-full py-4 px-6 rounded-xl bg-primary text-primary-foreground font-serif font-bold text-sm tracking-wide shadow-xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Submitting Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Inquiry</span>
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
