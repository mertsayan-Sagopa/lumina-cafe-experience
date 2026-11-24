"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  removeSharedCartItem,
  submitSharedOrder,
  updateSharedCartItemQty,
} from "@/lib/realtime-store";
import { SharedCartItem } from "@/lib/types";
import RollingPrice from "./RollingPrice";

interface SharedCartSheetProps {
  venueId: string;
  tableNumber: number;
  items: SharedCartItem[];
  open: boolean;
  onClose: () => void;
  onOrderSubmitted?: () => void;
}

export default function SharedCartSheet({
  venueId,
  tableNumber,
  items,
  open,
  onClose,
  onOrderSubmitted,
}: SharedCartSheetProps) {
  const totalCount = items.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = items.reduce(
    (acc, item) => acc + item.product.price * item.qty,
    0
  );

  const handleSubmitOrder = () => {
    const created = submitSharedOrder(venueId, tableNumber);
    if (created) {
      onClose();
      onOrderSubmitted?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--bg-overlay)] backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-1/2 z-50 flex max-h-[85vh] w-full max-w-md -translate-x-1/2 flex-col rounded-t-[32px] border-t border-[var(--border-strong)] bg-[var(--bg-card)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-accent)]">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
                    Ortak Masa Sepeti
                  </h3>
                  <p className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)]">
                    <Users className="h-3 w-3 text-[var(--brand-accent)]" />
                    Masa {tableNumber} · {totalCount} ürün
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-[var(--text-muted)] opacity-50" />
                  <p className="font-serif-display mt-3 text-base font-semibold text-[var(--text-primary)]">
                    Masa sepeti şu an boş
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Menüden dilediğiniz lezzetleri + Ekle butonuyla ekleyebilirsiniz.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] p-3"
                  >
                    <img
                      src={item.product.media_url}
                      alt={item.product.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="font-serif-display truncate text-sm font-semibold text-[var(--text-primary)]">
                          {item.product.name}
                        </p>
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                        {item.selectedOption && (
                          <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--brand-accent)]">
                            {item.selectedOption}
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--text-muted)]">
                          {item.addedBy}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold text-[var(--text-primary)]">
                        {(item.product.price * item.qty).toLocaleString("tr-TR")} ₺
                      </p>
                    </div>

                    {/* Quantity & Single Delete Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          removeSharedCartItem(venueId, tableNumber, item.id)
                        }
                        aria-label="Ürünü sil"
                        className="text-[var(--text-muted)] hover:text-rose-500 active:scale-90"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateSharedCartItemQty(
                              venueId,
                              tableNumber,
                              item.id,
                              -1
                            )
                          }
                          aria-label="Azalt"
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] active:scale-90"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[18px] text-center text-xs font-semibold text-[var(--text-primary)]">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateSharedCartItemQty(
                              venueId,
                              tableNumber,
                              item.id,
                              1
                            )
                          }
                          aria-label="Artır"
                          className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--brand-primary)] text-[var(--text-inverse)] active:scale-90"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 pb-6 pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">
                    Ortak Masa Toplamı
                  </span>
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    <RollingPrice value={totalPrice} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] py-3.5 text-sm font-semibold text-[var(--text-inverse)] shadow-lg active:scale-[0.98]"
                >
                  <ChefHat className="h-4 w-4" />
                  Siparişi Mutfağa Gönder
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
