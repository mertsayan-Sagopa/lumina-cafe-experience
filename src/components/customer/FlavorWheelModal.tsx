"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";

interface FlavorWheelModalProps {
  open: boolean;
  onClose: () => void;
}

interface WheelSegment {
  label: string;
  short: string;
  code: string;
  color: string;
  textColor: string;
}

const SEGMENTS: WheelSegment[] = [
  {
    label: "%10 Kahve İndirimi",
    short: "%10 İndirim",
    code: "LUMINA10",
    color: "#2C1E16",
    textColor: "#F7F3EC",
  },
  {
    label: "Ücretsiz Mini Cookie",
    short: "Mini Cookie",
    code: "COOKIE26",
    color: "#EFE9DF",
    textColor: "#2C1E16",
  },
  {
    label: "Barista Sürpriz Shot",
    short: "Extra Shot",
    code: "SHOTFREE",
    color: "#9E6B43",
    textColor: "#F7F3EC",
  },
  {
    label: "Yulaf / Badem Sütü İkram",
    short: "Bitkisel Süt",
    code: "OATGIFT",
    color: "#D6C3A5",
    textColor: "#2C1E16",
  },
  {
    label: "%15 Tatlı Ayrıcalığı",
    short: "%15 Tatlı",
    code: "SWEET15",
    color: "#4A3225",
    textColor: "#F7F3EC",
  },
  {
    label: "Sonraki Ziyarette Filtre Kahve",
    short: "Filtre Kahve",
    code: "NEXTV60",
    color: "#F7F3EC",
    textColor: "#2C1E16",
  },
];

const WHEEL_STORAGE_KEY = "lumina_flavor_wheel_prize_v1";

export default function FlavorWheelModal({
  open,
  onClose,
}: FlavorWheelModalProps) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<WheelSegment | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(WHEEL_STORAGE_KEY);
      if (saved) {
        setWonPrize(JSON.parse(saved) as WheelSegment);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSpin = () => {
    if (spinning || wonPrize) return;
    setSpinning(true);

    const targetIndex = Math.floor(Math.random() * SEGMENTS.length);
    const sliceAngle = 360 / SEGMENTS.length;
    // Align pointer at top (0 deg) with the center of targetIndex
    const targetOffset = 360 - (targetIndex * sliceAngle + sliceAngle / 2);
    const totalRotation = rotation + 360 * 5 + targetOffset;
    setRotation(totalRotation);

    window.setTimeout(() => {
      const prize = SEGMENTS[targetIndex];
      setSpinning(false);
      setWonPrize(prize);
      try {
        window.localStorage.setItem(WHEEL_STORAGE_KEY, JSON.stringify(prize));
      } catch {
        // ignore
      }
    }, 4200);
  };

  const sliceAngle = 360 / SEGMENTS.length;

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
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-[92%] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-[30px] border border-[var(--border-strong)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-float)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--brand-accent)]">
                  <Sparkles className="h-3 w-3" />
                  Lumina Ayrıcalık Çarkı
                </span>
                <h3 className="font-serif-display mt-0.5 text-xl font-semibold text-[var(--text-primary)]">
                  Lezzet Çarkını Çevir
                </h3>
                <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
                  Masa başına 1 çevirme hakkı · Şansın yaver giderse ikram bizden!
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Wheel Container */}
            <div className="relative mx-auto my-5 flex h-64 w-64 items-center justify-center">
              {/* Top Pointer */}
              <div className="absolute -top-2.5 left-1/2 z-20 -translate-x-1/2">
                <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[var(--brand-accent)] drop-shadow-md" />
              </div>

              {/* Rotating SVG Wheel */}
              <motion.div
                animate={{ rotate: rotation }}
                transition={{
                  duration: 4.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="h-full w-full rounded-full border-4 border-[var(--brand-accent)] shadow-xl"
              >
                <svg viewBox="0 0 200 200" className="h-full w-full rounded-full">
                  {SEGMENTS.map((seg, idx) => {
                    const startAngle = (idx * sliceAngle - 90) * (Math.PI / 180);
                    const endAngle =
                      ((idx + 1) * sliceAngle - 90) * (Math.PI / 180);
                    const x1 = 100 + 100 * Math.cos(startAngle);
                    const y1 = 100 + 100 * Math.sin(startAngle);
                    const x2 = 100 + 100 * Math.cos(endAngle);
                    const y2 = 100 + 100 * Math.sin(endAngle);
                    const midAngle = idx * sliceAngle + sliceAngle / 2;

                    return (
                      <g key={seg.code}>
                        <path
                          d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                          fill={seg.color}
                        />
                        <text
                          x="100"
                          y="34"
                          fill={seg.textColor}
                          fontSize="7.5"
                          fontWeight="600"
                          textAnchor="middle"
                          transform={`rotate(${midAngle}, 100, 100)`}
                        >
                          {seg.short}
                        </text>
                      </g>
                    );
                  })}
                  <circle
                    cx="100"
                    cy="100"
                    r="18"
                    fill="#F7F3EC"
                    stroke="#9E6B43"
                    strokeWidth="3"
                  />
                </svg>
              </motion.div>

              {/* Center Emblem */}
              <div className="pointer-events-none absolute z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow">
                <Gift className="h-4 w-4" />
              </div>
            </div>

            {/* Action / Result */}
            {wonPrize ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[var(--brand-accent)]/40 bg-[var(--brand-soft)] p-4 text-center"
              >
                <p className="text-[11px] font-medium text-[var(--text-secondary)]">
                  Tebrikler! Kazandığınız Ayrıcalık:
                </p>
                <p className="font-serif-display mt-1 text-lg font-semibold text-[var(--text-primary)]">
                  {wonPrize.label}
                </p>
                <p className="mt-2 inline-block rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-1 text-[11px] font-semibold tracking-widest text-[var(--brand-accent)]">
                  KOD: {wonPrize.code}
                </p>
                <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                  Sipariş sırasında baristamıza göstermeniz yeterlidir.
                </p>
              </motion.div>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full rounded-2xl bg-[var(--brand-primary)] py-3.5 text-sm font-semibold text-[var(--text-inverse)] shadow-lg transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                {spinning ? "Çark Dönüyor..." : "Şansımı Dene"}
              </button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
