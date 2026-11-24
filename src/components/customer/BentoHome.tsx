"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Clock,
  Coffee,
  Gift,
  Instagram,
  Share2,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { getSignatureProducts } from "@/lib/demo-data";
import {
  getDemoOrder,
  getLiveOrder,
  getSharedCart,
  subscribeRealtime,
} from "@/lib/realtime-store";
import { LiveOrderStatus, SharedCartItem, Venue } from "@/lib/types";
import FlavorWheelModal from "./FlavorWheelModal";
import LiveOrderBanner from "./LiveOrderBanner";
import RatingShieldModal from "./RatingShieldModal";
import SharedCartSheet from "./SharedCartSheet";
import SocialSheet from "./SocialSheet";
import TableActionsMenu from "./TableActionsMenu";
import WaiterCallSheet from "./WaiterCallSheet";

interface BentoHomeProps {
  venue: Venue;
  tableNumber: number;
  tableSlug: string;
}

export default function BentoHome({
  venue,
  tableNumber,
  tableSlug,
}: BentoHomeProps) {
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [waiterSheetOpen, setWaiterSheetOpen] = useState(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [socialSheetOpen, setSocialSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [remainingBill, setRemainingBill] = useState<number>(1095);
  const [sharedCart, setSharedCart] = useState<SharedCartItem[]>([]);
  const [liveOrder, setLiveOrder] = useState<LiveOrderStatus | null>(null);

  const signatureProducts = getSignatureProducts();

  const syncAll = useCallback(() => {
    const order = getDemoOrder(venue.id, tableNumber);
    const total = Math.max(
      0,
      order.items.filter((i) => !i.is_paid).reduce((s, i) => s + i.price, 0)
    );
    setRemainingBill(total);
    setSharedCart(getSharedCart(venue.id, tableNumber));
    setLiveOrder(getLiveOrder(venue.id, tableNumber));
  }, [venue.id, tableNumber]);

  useEffect(() => {
    syncAll();
    return subscribeRealtime(syncAll);
  }, [syncAll]);

  const cartCount = sharedCart.reduce((acc, item) => acc + item.qty, 0);
  const basePath = `/${venue.slug}/${tableSlug}`;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-[var(--bg-base)] px-4 pb-12 pt-5 transition-colors duration-300">
      {/* Header: Centered Venue Logo + Prominent Right Masa Badge */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-20 mb-5 grid grid-cols-3 items-center"
      >
        {/* Left: Flavor Wheel Quick Trigger */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={() => setWheelOpen(true)}
            aria-label="Lezzet Çarkı"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--brand-accent)] shadow-sm transition-transform active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        {/* Center: Venue Logo & Serif Brand Name */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--brand-primary)] shadow-sm">
            <Coffee className="h-5 w-5" />
          </div>
          <h1 className="font-serif-display mt-1.5 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
            {venue.name}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Roastery &amp; Bistro
          </p>
        </div>

        {/* Right: Prominent Clickable Masa 12 Pill */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setTableMenuOpen(true)}
            className="relative flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--text-inverse)] shadow-md ring-2 ring-[var(--brand-accent)]/35 transition-transform active:scale-95"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span>Masa {tableNumber}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[10px] font-bold text-white shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </motion.header>

      {/* Live Order Status Banner (if an order was sent to kitchen) */}
      <LiveOrderBanner order={liveOrder} />

      {/* Main Hero: Menu Focused */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <Link
          href={`${basePath}/menu`}
          className="group relative block h-60 overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-transform active:scale-[0.985]"
        >
          <img
            src="/images/products/latte-3d.jpg"
            alt="Lumina 3D Menü"
            className="animate-motion-zoom absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1510]/90 via-[#1f1510]/35 to-transparent" />

          <div className="relative flex h-full flex-col justify-between p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[11px] font-medium text-[#f7f3ec] backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-[#e5d4b8]" />
                3D Görsel Menü
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-[#e8dfd3]">
                <UtensilsCrossed className="h-3.5 w-3.5 text-[#d6c3a5]" />
                <span>İmza Lezzetler · Ortak Masa Sepeti</span>
              </div>
              <h2 className="font-serif-display text-2xl font-semibold tracking-tight text-white">
                Menüyü Keşfet
              </h2>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Signature Recommendations Preview */}
      <section className="mt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-accent)]">
              Önerilenler
            </p>
            <h2 className="font-serif-display text-xl font-semibold text-[var(--text-primary)]">
              İmza Ürünlerimiz
            </h2>
          </div>
          <Link
            href={`${basePath}/menu`}
            className="text-xs font-medium text-[var(--brand-accent)] hover:underline"
          >
            Tümünü Gör
          </Link>
        </div>

        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {signatureProducts.map((product) => (
            <Link
              key={product.id}
              href={`${basePath}/menu`}
              className="group w-56 shrink-0 overflow-hidden rounded-[24px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]"
            >
              <div className="relative h-36 w-full overflow-hidden bg-[var(--bg-elevated)]">
                <img
                  src={product.media_url}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-md">
                  <Clock className="h-2.5 w-2.5 text-[#e5d4b8]" />
                  {product.prep_time}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded-xl bg-[#2c1e16]/90 px-2.5 py-1 text-xs font-semibold text-[#f7f3ec] backdrop-blur-md">
                  {product.price} ₺
                </span>
              </div>
              <div className="p-3.5">
                <h3 className="font-serif-display truncate text-sm font-semibold text-[var(--text-primary)]">
                  {product.name}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                  {product.portion ?? product.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Playful Gamification Banner: Lezzet Çarkı */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setWheelOpen(true)}
        className="mt-5 flex w-full items-center justify-between rounded-[24px] border border-[var(--border-strong)] bg-[var(--bg-card)] px-4 py-4 text-left shadow-[var(--shadow-card)]"
      >
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand-soft)] text-[var(--brand-accent)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-serif-display text-base font-semibold text-[var(--text-primary)]">
              Lezzet Çarkını Çevir
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Masa başına 1 çevirme hakkı · Şansın yaver giderse ikram bizden!
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--brand-accent)]" />
      </motion.button>

      {/* Playful Secondary Row */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href={`${basePath}/hediye-ceki`}
          className="flex flex-col justify-between rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-left shadow-sm transition-transform active:scale-[0.97]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-accent)]">
            <Gift className="h-4 w-4" />
          </div>
          <div className="mt-3.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Hediye Çeki
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              Yan masaya sürpriz yap veya arkadaşına kahve ısmarla
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setRatingModalOpen(true)}
          className="flex flex-col justify-between rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-left shadow-sm transition-transform active:scale-[0.97]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-[var(--brand-accent)]">
            <Star className="h-4 w-4" />
          </div>
          <div className="mt-3.5">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              Bizi Puanla
            </p>
            <p className="mt-0.5 text-[11px] text-[var(--text-secondary)]">
              Deneyimini paylaş
            </p>
          </div>
        </button>
      </div>

      {/* Social Bar */}
      <button
        type="button"
        onClick={() => setSocialSheetOpen(true)}
        className="mt-3 flex w-full items-center justify-between rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-card)] px-4 py-3 text-left shadow-sm active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--bg-card)] bg-[var(--bg-elevated)] text-[var(--brand-accent)]">
              <Instagram className="h-3.5 w-3.5" />
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--bg-card)] bg-[var(--brand-soft)] text-[var(--brand-primary)]">
              <Share2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">
              Instagram · TikTok · Konum
            </p>
            <p className="text-[10px] text-[var(--text-secondary)]">
              Lumina atmosferini paylaş
            </p>
          </div>
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
      </button>

      <p className="mt-6 text-center text-[11px] text-[var(--text-muted)]">
        Garson, Hesap ve Sepet için sağ üstteki Masa {tableNumber} rozetine dokunun
      </p>

      {/* Masa 12 Aksiyon Menüsü */}
      <TableActionsMenu
        venue={venue}
        tableNumber={tableNumber}
        tableSlug={tableSlug}
        remainingBill={remainingBill}
        cartCount={cartCount}
        open={tableMenuOpen}
        onClose={() => setTableMenuOpen(false)}
        onOpenWaiter={() => setWaiterSheetOpen(true)}
        onOpenCart={() => setCartSheetOpen(true)}
      />

      <SharedCartSheet
        venueId={venue.id}
        tableNumber={tableNumber}
        items={sharedCart}
        open={cartSheetOpen}
        onClose={() => setCartSheetOpen(false)}
        onOrderSubmitted={syncAll}
      />

      <WaiterCallSheet
        venueId={venue.id}
        tableNumber={tableNumber}
        open={waiterSheetOpen}
        onClose={() => setWaiterSheetOpen(false)}
      />

      <RatingShieldModal
        venue={venue}
        tableNumber={tableNumber}
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
      />

      <SocialSheet
        venue={venue}
        open={socialSheetOpen}
        onClose={() => setSocialSheetOpen(false)}
      />

      <FlavorWheelModal
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
      />
    </div>
  );
}
