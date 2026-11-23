"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ReceiptText,
  RotateCcw,
  Users,
} from "lucide-react";
import {
  getDemoOrder,
  payEqualSplit,
  payOrderItems,
  resetDemoOrder,
  subscribeRealtime,
} from "@/lib/realtime-store";
import { DemoOrder, Venue } from "@/lib/types";
import MockPaymentModal from "./MockPaymentModal";

interface SplitBillViewProps {
  venue: Venue;
  tableNumber: number;
  tableSlug: string;
}

export default function SplitBillView({
  venue,
  tableNumber,
  tableSlug,
}: SplitBillViewProps) {
  const [order, setOrder] = useState<DemoOrder | null>(null);
  const [mode, setMode] = useState<"items" | "equal">("items");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [splitCount, setSplitCount] = useState<number>(4);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const loadOrder = useCallback(() => {
    setOrder(getDemoOrder(venue.id, tableNumber));
  }, [venue.id, tableNumber]);

  useEffect(() => {
    loadOrder();
    return subscribeRealtime(loadOrder);
  }, [loadOrder]);

  const remainingTotal = useMemo(() => {
    if (!order) return 0;
    const sum = order.items
      .filter((i) => !i.is_paid)
      .reduce((acc, i) => acc + i.price, 0);
    return Math.max(0, sum);
  }, [order]);

  const selectedTotal = useMemo(() => {
    if (!order) return 0;
    return order.items
      .filter((i) => !i.is_paid && selectedIds.includes(i.id))
      .reduce((acc, i) => acc + i.price, 0);
  }, [order, selectedIds]);

  const equalShare = useMemo(() => {
    if (remainingTotal <= 0) return 0;
    return Math.ceil(remainingTotal / splitCount);
  }, [remainingTotal, splitCount]);

  const payableAmount = mode === "items" ? selectedTotal : equalShare;

  const toggleItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePaymentSuccess = () => {
    if (mode === "items") {
      payOrderItems(venue.id, tableNumber, selectedIds);
      setSelectedIds([]);
    } else {
      payEqualSplit(venue.id, tableNumber, equalShare);
    }
    setPaymentOpen(false);
    loadOrder();
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[var(--bg-base)] px-4 pb-28 pt-5 transition-colors duration-300">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <Link
          href={`/${venue.slug}/${tableSlug}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <h1 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
            Bölmeli Adisyon
          </h1>
          <p className="text-[11px] text-[var(--brand-accent)]">
            Masa {tableNumber} · Canlı Hesap
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetDemoOrder(venue.id, tableNumber);
            setSelectedIds([]);
            loadOrder();
          }}
          title="Demo adisyonu sıfırla"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Summary Card */}
      <div className="mb-5 rounded-[26px] border border-[#d9a05b]/30 bg-gradient-to-br from-[#201912] to-[#141210] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Kalan Masa Toplamı</p>
            <p className="mt-1 text-3xl font-bold text-[#f3c78a]">
              {remainingTotal.toLocaleString("tr-TR")} ₺
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9a05b]/15 text-[#f3c78a]">
            <ReceiptText className="h-6 w-6" />
          </div>
        </div>
        {remainingTotal === 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />
            Masa hesabı tamamen ödendi!
          </div>
        )}
      </div>

      {/* Mode Switcher */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl border border-white/8 bg-[#151311] p-1.5">
        <button
          type="button"
          onClick={() => setMode("items")}
          className={`rounded-xl py-2.5 text-xs font-semibold transition-all ${
            mode === "items"
              ? "bg-gradient-to-r from-[#d9a05b] to-[#f3c78a] text-[#0c0b0a]"
              : "text-zinc-400"
          }`}
        >
          Ürüne Göre Böl
        </button>
        <button
          type="button"
          onClick={() => setMode("equal")}
          className={`rounded-xl py-2.5 text-xs font-semibold transition-all ${
            mode === "equal"
              ? "bg-gradient-to-r from-[#d9a05b] to-[#f3c78a] text-[#0c0b0a]"
              : "text-zinc-400"
          }`}
        >
          Eşit Böl
        </button>
      </div>

      {mode === "items" ? (
        <div className="space-y-2.5">
          <p className="text-xs text-zinc-400">
            Kendi tükettiğiniz ürünleri seçip anında ödeyin:
          </p>
          {order?.items.map((item) => {
            const isCredit = item.price < 0;
            const isSelected = selectedIds.includes(item.id);
            return (
              <motion.button
                key={item.id}
                type="button"
                disabled={item.is_paid || isCredit}
                whileTap={{ scale: item.is_paid || isCredit ? 1 : 0.98 }}
                onClick={() => toggleItem(item.id)}
                className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  item.is_paid
                    ? "border-white/5 bg-[#12100e] opacity-50"
                    : isCredit
                    ? "border-emerald-500/20 bg-emerald-500/10"
                    : isSelected
                    ? "border-[#d9a05b] bg-[#211a13]"
                    : "border-white/8 bg-[#161412]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg border ${
                      item.is_paid
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : isSelected
                        ? "border-[#d9a05b] bg-[#d9a05b] text-[#0c0b0a]"
                        : "border-white/15 bg-black/30"
                    }`}
                  >
                    {(item.is_paid || isSelected) && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        item.is_paid
                          ? "text-zinc-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.name}
                    </p>
                    {item.is_paid && (
                      <span className="text-[10px] font-medium text-emerald-400">
                        Ödendi
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isCredit
                      ? "text-emerald-300"
                      : item.is_paid
                      ? "text-zinc-500"
                      : "text-[#f3c78a]"
                  }`}
                >
                  {item.price.toLocaleString("tr-TR")} ₺
                </span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/8 bg-[#161412] p-5">
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
            <Users className="h-4 w-4 text-[#d9a05b]" />
            Masa Kaç Kişiye Bölünsün?
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSplitCount(num)}
                className={`rounded-2xl border py-3 text-sm font-semibold transition-all ${
                  splitCount === num
                    ? "border-[#d9a05b] bg-[#d9a05b]/20 text-[#f3c78a]"
                    : "border-white/8 bg-[#1c1916] text-zinc-400"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/8 bg-black/30 p-4 text-center">
            <p className="text-xs text-zinc-400">Kişi Başı Düşen Tutar</p>
            <p className="mt-1 text-3xl font-bold text-[#f3c78a]">
              {equalShare.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        </div>
      )}

      {/* Fixed Bottom Pay Bar */}
      <div className="fixed bottom-4 left-1/2 z-30 w-[92%] max-w-md -translate-x-1/2">
        <button
          type="button"
          disabled={payableAmount <= 0}
          onClick={() => setPaymentOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d9a05b] to-[#f3c78a] py-4 text-sm font-semibold text-[#0c0b0a] shadow-2xl active:scale-[0.98] disabled:opacity-40"
        >
          {payableAmount > 0
            ? `Ödemeyi Tamamla (Demo) · ${payableAmount.toLocaleString("tr-TR")} ₺`
            : mode === "items"
            ? "Ödemek için ürün seçin"
            : "Ödenecek tutar kalmadı"}
        </button>
      </div>

      <MockPaymentModal
        open={paymentOpen}
        amount={payableAmount}
        title="Adisyon Ödemesi"
        subtitle={`Masa ${tableNumber} · ${
          mode === "items"
            ? `${selectedIds.length} ürün seçildi`
            : `${splitCount} kişilik eşit bölüşüm`
        }`}
        onClose={() => setPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
