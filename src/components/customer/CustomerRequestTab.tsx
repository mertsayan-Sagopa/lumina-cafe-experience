"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { createCustomerWish } from "@/lib/realtime-store";
import { CustomerWish } from "@/lib/types";

interface CustomerRequestTabProps {
  venueId: string;
  tableNumber: number;
}

const CATEGORIES: { id: CustomerWish["category"]; label: string }[] = [
  { id: "yeni-urun", label: "Yeni Ürün İsteği" },
  { id: "diyet", label: "Vegan / Glutensiz" },
  { id: "atmosfer", label: "Mekan & Müzik" },
  { id: "diger", label: "Diğer Öneri" },
];

const QUICK_SUGGESTIONS = [
  "Şekersiz badem sütlü tatlı",
  "Kafeinsiz soğuk demleme",
  "Glutensiz kahvaltı tabağı",
  "Matcha tiramisu",
];

export default function CustomerRequestTab({
  venueId,
  tableNumber,
}: CustomerRequestTabProps) {
  const [category, setCategory] =
    useState<CustomerWish["category"]>("yeni-urun");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    createCustomerWish(venueId, tableNumber, category, message);
    setSubmitted(true);
    setMessage("");
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 text-center shadow-[var(--shadow-card)]"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="font-serif-display mt-4 text-xl font-semibold text-[var(--text-primary)]">
          Talebiniz Bize Ulaştı
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
          Menümüzü ve deneyimimizi misafirlerimizin istekleriyle şekillendiriyoruz.
          Öneriniz mutfak ve barista ekibimizle paylaşıldı.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-5 inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-5 py-2.5 text-xs font-semibold text-[var(--text-primary)] active:scale-95"
        >
          Yeni Talep Gönder
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-accent)]">
          <MessageSquarePlus className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
            Menüde Görmek İstedikleriniz
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            Kafemizde şu an bulunmayan ama olmasını istediğiniz lezzetleri veya
            önerilerinizi bizimle paylaşın.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const active = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                active
                  ? "bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                  : "border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Quick Chips */}
      <div className="mt-4">
        <p className="mb-2 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          <Sparkles className="h-3 w-3 text-[var(--brand-accent)]" />
          Hızlı İlham
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMessage(item)}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-2.5 py-1.5 text-[11px] text-[var(--text-secondary)] hover:border-[var(--brand-accent)] active:scale-95"
            >
              + {item}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Örn: Yulaf sütlü soğuk balkabağı latte veya glutensiz brownie görmek isterim..."
          className="w-full resize-none rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3.5 py-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-accent)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] py-3.5 text-xs font-semibold text-[var(--text-inverse)] shadow-md transition-opacity disabled:opacity-40 active:scale-[0.98]"
        >
          <Send className="h-3.5 w-3.5" />
          Talebi İlet
        </button>
      </form>
    </motion.div>
  );
}
