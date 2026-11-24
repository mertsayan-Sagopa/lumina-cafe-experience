"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  BellRing,
  HeartHandshake,
  Moon,
  ReceiptText,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import {
  applyLuxuryTheme,
  getSavedTheme,
  LuxuryTheme,
} from "@/lib/theme";
import { Venue } from "@/lib/types";

interface TableActionsMenuProps {
  venue: Venue;
  tableNumber: number;
  tableSlug: string;
  remainingBill: number;
  cartCount?: number;
  open: boolean;
  onClose: () => void;
  onOpenWaiter: () => void;
  onOpenCart?: () => void;
}

export default function TableActionsMenu({
  venue,
  tableNumber,
  tableSlug,
  remainingBill,
  cartCount = 0,
  open,
  onClose,
  onOpenWaiter,
  onOpenCart,
}: TableActionsMenuProps) {
  const [theme, setTheme] = useState<LuxuryTheme>("silk-cream");

  useEffect(() => {
    setTheme(getSavedTheme());
  }, [open]);

  const toggleTheme = (next: LuxuryTheme) => {
    setTheme(next);
    applyLuxuryTheme(next);
  };

  const basePath = `/${venue.slug}/${tableSlug}`;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-4 top-16 z-50 w-[min(92vw,340px)] overflow-hidden rounded-[26px] border border-[var(--border-strong)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-float)]"
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <p className="font-serif-display text-base font-semibold text-[var(--text-primary)]">
                  Masa {tableNumber} Hızlı Aksiyonlar
                </p>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Tek dokunuşla servis, hesap ve ortak sepet
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Primary 3 Quick Actions: Sepetim, Garson Çağır, Hesap İste */}
            <div className="space-y-2">
              {onOpenCart && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className="flex w-full items-center justify-between rounded-2xl border border-[var(--brand-accent)]/35 bg-[var(--brand-soft)] px-3.5 py-3 text-left transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-[var(--text-inverse)]">
                      <ShoppingBag className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Sepetim (Ortak Masa)
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {cartCount > 0
                          ? `${cartCount} ürün sepette bekliyor`
                          : "Masadaki ürünleri görüntüle"}
                      </p>
                    </div>
                  </div>
                  {cartCount > 0 ? (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[var(--brand-primary)] px-2 text-[11px] font-bold text-[var(--text-inverse)]">
                      {cartCount}
                    </span>
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-[var(--brand-accent)]" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWaiter();
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-3.5 py-3 text-left transition-colors hover:border-[var(--brand-accent)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-accent)]">
                    <BellRing className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Garson Çağır
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      Su, peçete veya masa servisi
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
              </button>

              <Link
                href={`${basePath}/adisyon`}
                onClick={onClose}
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-3.5 py-3 text-left transition-colors hover:border-[var(--brand-accent)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/12 text-emerald-700">
                    <ReceiptText className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Hesap İste · Böl &amp; Öde
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)]">
                      {remainingBill > 0
                        ? `Kalan: ${remainingBill.toLocaleString("tr-TR")} ₺`
                        : "Hesap ödendi"}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
              </Link>

              <Link
                href={`${basePath}/bahsis`}
                onClick={onClose}
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-3.5 py-2.5 text-left transition-colors hover:border-[var(--brand-accent)] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/12 text-rose-600">
                    <HeartHandshake className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">
                      Dijital Bahşiş
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)]">
                      Ekibimize teşekkür et
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
              </Link>
            </div>

            {/* Luxury Theme Switcher */}
            <div className="mt-3 border-t border-[var(--border-subtle)] pt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                Görünüm Teması
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => toggleTheme("silk-cream")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-medium transition-all ${
                    theme === "silk-cream"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  İpek Krem
                </button>
                <button
                  type="button"
                  onClick={() => toggleTheme("matte-obsidian")}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-medium transition-all ${
                    theme === "matte-obsidian"
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Mat Obsidyen
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
