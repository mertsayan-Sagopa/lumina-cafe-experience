"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChefHat, Clock, Utensils, X } from "lucide-react";
import { clearLiveOrder, updateLiveOrderStage } from "@/lib/realtime-store";
import { LiveOrderStatus } from "@/lib/types";

interface LiveOrderBannerProps {
  order: LiveOrderStatus | null;
}

const STAGES = [
  { key: "received", label: "Sipariş Alındı" },
  { key: "preparing", label: "Sipariş Mutfakta" },
  { key: "serving", label: "Servis Ediliyor" },
] as const;

export default function LiveOrderBanner({ order }: LiveOrderBannerProps) {
  const [remainingMin, setRemainingMin] = useState<number>(
    order?.estimated_minutes ?? 8
  );

  useEffect(() => {
    if (!order) return;
    setRemainingMin(order.estimated_minutes);

    // Demo live progression: tick down 1 minute every 20 seconds so guests can see live status
    const timer = window.setInterval(() => {
      setRemainingMin((prev) => {
        const next = Math.max(1, prev - 1);
        if (next <= 2 && order.status === "preparing") {
          updateLiveOrderStage(
            order.venue_id,
            order.table_number,
            "serving",
            next
          );
        }
        return next;
      });
    }, 20000);

    return () => window.clearInterval(timer);
  }, [order]);

  if (!order) return null;

  const activeIdx =
    order.status === "received" ? 0 : order.status === "preparing" ? 1 : 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-[24px] border border-[var(--border-strong)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand-accent)]">
            {order.status === "serving" ? (
              <Utensils className="h-4 w-4" />
            ) : (
              <ChefHat className="h-4 w-4" />
            )}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <p className="text-xs font-semibold text-[var(--text-primary)]">
                {order.status === "serving"
                  ? "Siparişiniz Masanıza Geliyor!"
                  : "Siparişiniz Mutfakta Hazırlanıyor"}
              </p>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--brand-accent)] font-medium">
              <Clock className="h-3 w-3" />
              Tahmini kalan süre: ~{remainingMin} dk
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => clearLiveOrder(order.venue_id, order.table_number)}
          aria-label="Bildirimi kapat"
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* 3-Step Live Progress */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {STAGES.map((stage, idx) => {
          const done = idx <= activeIdx;
          return (
            <div key={stage.key} className="space-y-1">
              <div
                className={`h-1.5 w-full rounded-full transition-colors ${
                  done ? "bg-[var(--brand-accent)]" : "bg-[var(--bg-elevated)]"
                }`}
              />
              <p
                className={`flex items-center gap-1 text-[10px] font-medium ${
                  done
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-muted)]"
                }`}
              >
                {done && <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />}
                <span className="truncate">{stage.label}</span>
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
