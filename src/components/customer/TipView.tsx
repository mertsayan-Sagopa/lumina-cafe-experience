"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChefHat,
  Coffee,
  HeartHandshake,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { createTip } from "@/lib/realtime-store";
import { TipRecord, Venue } from "@/lib/types";
import MockPaymentModal from "./MockPaymentModal";

interface TipViewProps {
  venue: Venue;
  tableNumber: number;
  tableSlug: string;
}

const PRESET_AMOUNTS = [50, 100, 150, 200];

const DEPARTMENTS: {
  id: TipRecord["department"];
  label: string;
  icon: typeof Coffee;
}[] = [
  { id: "barista", label: "Barista", icon: Coffee },
  { id: "kitchen", label: "Mutfak", icon: ChefHat },
  { id: "service", label: "Servis", icon: UserCheck },
];

export default function TipView({
  venue,
  tableNumber,
  tableSlug,
}: TipViewProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [department, setDepartment] =
    useState<TipRecord["department"]>("barista");
  const [note, setNote] = useState<string>("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [sentTip, setSentTip] = useState<TipRecord | null>(null);

  const finalAmount = customAmount ? Number(customAmount) || 0 : amount;

  const handleSuccess = () => {
    const tip = createTip(venue.id, tableNumber, finalAmount, department, note);
    setPaymentOpen(false);
    setSentTip(tip);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[var(--bg-base)] px-4 pb-12 pt-5 transition-colors duration-300">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${venue.slug}/${tableSlug}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <h1 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
            Dijital Bahşiş
          </h1>
          <p className="text-[11px] text-[var(--brand-accent)]">
            Masa {tableNumber} · {venue.name}
          </p>
        </div>
        <div className="w-9" />
      </div>

      {sentTip ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[28px] border border-emerald-500/30 bg-gradient-to-b from-[#17211b] to-[#12100e] p-7 text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">
            Çok Teşekkür Ederiz!
          </h2>
          <p className="mt-2 text-sm text-zinc-300">
            <span className="font-semibold text-[#f3c78a]">
              {sentTip.amount} ₺
            </span>{" "}
            bahşişiniz ve teşekkür notunuz ekibimize anlık olarak iletildi.
          </p>
          {sentTip.note && (
            <p className="mt-3 rounded-2xl border border-white/8 bg-black/30 px-4 py-3 text-xs italic text-zinc-300">
              &ldquo;{sentTip.note}&rdquo;
            </p>
          )}
          <Link
            href={`/${venue.slug}/${tableSlug}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white/10 py-3.5 text-sm font-semibold text-white"
          >
            Ana Ekrana Dön
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {/* Hero Banner */}
          <div className="rounded-[26px] border border-rose-500/25 bg-gradient-to-br from-[#231518] to-[#141210] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-300">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">
                  Ekibimizi Mutlu Et
                </h2>
                <p className="text-xs text-zinc-400">
                  %100&apos;ü doğrudan seçtiğiniz ekibe ulaşır
                </p>
              </div>
            </div>
          </div>

          {/* Preset Amounts */}
          <div>
            <p className="mb-2.5 text-xs font-medium text-zinc-400">
              Tutar Seçin
            </p>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((val) => {
                const active = !customAmount && amount === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount("");
                    }}
                    className={`rounded-2xl border py-3.5 text-sm font-semibold transition-all ${
                      active
                        ? "border-[#d9a05b] bg-[#d9a05b]/20 text-[#f3c78a]"
                        : "border-white/8 bg-[#161412] text-zinc-300"
                    }`}
                  >
                    {val} ₺
                  </button>
                );
              })}
            </div>

            <input
              type="number"
              min={10}
              placeholder="veya özel tutar girin (₺)"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#161412] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#d9a05b] focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <p className="mb-2.5 text-xs font-medium text-zinc-400">
              Hangi Ekibe İletilsin?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEPARTMENTS.map((dept) => {
                const Icon = dept.icon;
                const active = department === dept.id;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartment(dept.id)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border py-3.5 text-xs font-medium transition-all ${
                      active
                        ? "border-[#d9a05b] bg-[#d9a05b]/20 text-[#f3c78a]"
                        : "border-white/8 bg-[#161412] text-zinc-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {dept.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thank you note */}
          <div>
            <p className="mb-2 text-xs font-medium text-zinc-400">
              Kısa Teşekkür Notu (İsteğe Bağlı)
            </p>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn: Kahve ve servis harikaydı!"
              className="w-full rounded-2xl border border-white/10 bg-[#161412] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-[#d9a05b] focus:outline-none"
            />
          </div>

          <button
            type="button"
            disabled={finalAmount <= 0}
            onClick={() => setPaymentOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d9a05b] to-[#f3c78a] py-4 text-sm font-semibold text-[#0c0b0a] shadow-xl active:scale-[0.98] disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            Bahşiş Gönder · {finalAmount.toLocaleString("tr-TR")} ₺
          </button>
        </div>
      )}

      <MockPaymentModal
        open={paymentOpen}
        amount={finalAmount}
        title="Dijital Bahşiş"
        subtitle={`Masa ${tableNumber} · ${
          DEPARTMENTS.find((d) => d.id === department)?.label
        } Ekibi`}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
