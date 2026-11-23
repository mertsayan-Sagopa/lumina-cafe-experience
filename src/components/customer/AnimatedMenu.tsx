"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Clock,
  Flame,
  MessageSquarePlus,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import {
  ALLERGEN_LABELS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  getSignatureProducts,
} from "@/lib/demo-data";
import { getDataDrivenPairing } from "@/lib/pairing-engine";
import { getDemoOrder, subscribeRealtime } from "@/lib/realtime-store";
import { Product, Venue } from "@/lib/types";
import CustomerRequestTab from "./CustomerRequestTab";
import FlavorWheelModal from "./FlavorWheelModal";
import RollingPrice from "./RollingPrice";
import TableActionsMenu from "./TableActionsMenu";
import WaiterCallSheet from "./WaiterCallSheet";

interface AnimatedMenuProps {
  venue: Venue;
  tableNumber: number;
  tableSlug: string;
}

const TAB_RECOMMENDED = "tab-recommended";
const TAB_WISHES = "tab-wishes";

export default function AnimatedMenu({
  venue,
  tableNumber,
  tableSlug,
}: AnimatedMenuProps) {
  // Signature / Recommended products appear immediately when entering the menu
  const [activeTab, setActiveTab] = useState<string>(TAB_RECOMMENDED);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectionList, setSelectionList] = useState<
    { product: Product; qty: number }[]
  >([]);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [waiterSheetOpen, setWaiterSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [remainingBill, setRemainingBill] = useState<number>(1095);

  const syncBill = useCallback(() => {
    const order = getDemoOrder(venue.id, tableNumber);
    const total = Math.max(
      0,
      order.items.filter((i) => !i.is_paid).reduce((s, i) => s + i.price, 0)
    );
    setRemainingBill(total);
  }, [venue.id, tableNumber]);

  useEffect(() => {
    syncBill();
    return subscribeRealtime(syncBill);
  }, [syncBill]);

  const signatureProducts = useMemo(() => getSignatureProducts(), []);

  const filteredProducts = useMemo(() => {
    if (activeTab === TAB_RECOMMENDED) return signatureProducts;
    if (activeTab === TAB_WISHES) return [];
    return DEMO_PRODUCTS.filter((p) => p.category_id === activeTab);
  }, [activeTab, signatureProducts]);

  const cartProductIds = useMemo(
    () => selectionList.map((i) => i.product.id),
    [selectionList]
  );

  // Data-driven Smart Pairing (never random)
  const smartPairing = useMemo(
    () => getDataDrivenPairing(selectedProduct, cartProductIds),
    [selectedProduct, cartProductIds]
  );

  const totalSelectedCount = useMemo(
    () => selectionList.reduce((acc, item) => acc + item.qty, 0),
    [selectionList]
  );

  const totalSelectedPrice = useMemo(
    () =>
      selectionList.reduce(
        (acc, item) => acc + item.product.price * item.qty,
        0
      ),
    [selectionList]
  );

  const addToSelection = (product: Product) => {
    setSelectionList((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
    setAddedToast(`${product.name} sepete eklendi`);
    window.setTimeout(() => {
      setAddedToast((prev) =>
        prev === `${product.name} sepete eklendi` ? null : prev
      );
    }, 2000);
  };

  const getMotionClass = (style: Product["motion_style"]) => {
    if (style === "zoom") return "animate-motion-zoom";
    if (style === "pan") return "animate-motion-pan";
    return "animate-motion-float";
  };

  const tabs = [
    { id: TAB_RECOMMENDED, name: "Önerilenler" },
    ...DEMO_CATEGORIES.map((c) => ({ id: c.id, name: c.name })),
    { id: TAB_WISHES, name: "İstek & Öneri" },
  ];

  const activeCategoryMeta = DEMO_CATEGORIES.find((c) => c.id === activeTab);

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md bg-[var(--bg-base)] pb-28 transition-colors duration-300">
      {/* Sticky Top Header: Centered Logo + Right Masa 12 Action Pill */}
      <div className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-glass)] backdrop-blur-xl">
        <div className="grid grid-cols-3 items-center px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Link
              href={`/${venue.slug}/${tableSlug}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm active:scale-95"
              aria-label="Ana ekrana dön"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setWheelOpen(true)}
              aria-label="Lezzet Çarkı"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--brand-accent)] shadow-sm active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="font-serif-display text-base font-semibold tracking-tight text-[var(--text-primary)]">
              {venue.name}
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--brand-accent)]">
              3D Menü
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setTableMenuOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm active:scale-95"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span>Masa {tableNumber}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
            </button>
          </div>
        </div>

        {/* Sticky Horizontal Category Tabs */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-3 pt-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-[var(--text-inverse)]"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeMenuTabPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-[var(--brand-primary)]"
                  />
                )}
                {tab.id === TAB_RECOMMENDED && (
                  <Sparkles className="relative z-10 h-3 w-3" />
                )}
                {tab.id === TAB_WISHES && (
                  <MessageSquarePlus className="relative z-10 h-3 w-3" />
                )}
                <span className="relative z-10">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === TAB_WISHES ? (
        <div className="px-4 pt-5">
          <CustomerRequestTab venueId={venue.id} tableNumber={tableNumber} />
        </div>
      ) : (
        <>
          {/* Section Header */}
          <div className="px-4 pb-2 pt-5">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-serif-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {activeTab === TAB_RECOMMENDED
                    ? "Önerilenler"
                    : activeCategoryMeta?.name}
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  {activeTab === TAB_RECOMMENDED
                    ? "Şefin ve baristanın en iddialı imza lezzetleri"
                    : activeCategoryMeta?.subtitle}
                </p>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">
                {filteredProducts.length} lezzet
              </span>
            </div>
          </div>

          {/* 3D Product Cards */}
          <div className="space-y-4 px-4 pt-3">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: index * 0.05 }}
                onClick={() => setSelectedProduct(product)}
                className="group cursor-pointer overflow-hidden rounded-[26px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] transition-colors hover:border-[var(--brand-accent)] active:scale-[0.985]"
              >
                {/* 3D Studio Visual Container */}
                <div className="relative h-52 w-full overflow-hidden bg-[var(--bg-elevated)]">
                  <img
                    src={product.media_url}
                    alt={product.name}
                    loading="lazy"
                    className={`${getMotionClass(
                      product.motion_style
                    )} h-full w-full object-cover`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15" />

                  {/* Top Badges — Prep Time Preserved Top-Right */}
                  <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
                    {product.badge ? (
                      <span className="rounded-full border border-white/25 bg-[#2c1e16]/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-[#f7f3ec] backdrop-blur-md">
                        {product.badge}
                      </span>
                    ) : (
                      <span />
                    )}

                    <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                      <Clock className="h-3 w-3 text-[#e5d4b8]" />
                      {product.prep_time}
                    </span>
                  </div>

                  {/* Price Tag — Preserved Bottom-Right */}
                  <div className="absolute bottom-3 right-3 rounded-2xl border border-white/15 bg-[#2c1e16]/90 px-3.5 py-1.5 text-sm font-semibold text-[#f7f3ec] shadow-md backdrop-blur-md">
                    {product.price} ₺
                  </div>
                </div>

                {/* Detailed Card Body */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif-display text-lg font-semibold text-[var(--text-primary)]">
                        {product.name}
                      </h3>
                      {product.portion && (
                        <p className="mt-0.5 text-[11px] font-medium text-[var(--brand-accent)]">
                          {product.portion}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToSelection(product);
                      }}
                      aria-label={`${product.name} ekle`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--text-inverse)] shadow-sm transition-transform active:scale-90"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {product.description}
                  </p>

                  {/* Tasting Notes */}
                  {product.tasting_notes && product.tasting_notes.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {product.tasting_notes.map((note) => (
                        <span
                          key={note}
                          className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Allergens & Smart Pairing Indicator */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-subtle)] pt-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {product.allergens.length > 0 ? (
                        product.allergens.map((a) => (
                          <span
                            key={a}
                            className="rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                          >
                            {ALLERGEN_LABELS[a].short}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-md border border-emerald-600/20 bg-emerald-600/10 px-2 py-0.5 text-[10px] text-emerald-700">
                          Alerjen İçermez
                        </span>
                      )}
                    </div>

                    {product.co_purchase_stats &&
                      product.co_purchase_stats.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--brand-accent)]">
                          <TrendingUp className="h-3 w-3" />%
                          {product.co_purchase_stats[0].match_rate} Eşleşme
                        </span>
                      )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </>
      )}

      {/* Floating Cart Summary Bar with 1-Second Downward Rolling Price Animation */}
      <AnimatePresence>
        {totalSelectedCount > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            className="fixed bottom-4 left-1/2 z-30 w-[92%] max-w-md -translate-x-1/2"
          >
            <div className="flex items-center justify-between rounded-[22px] border border-[var(--border-strong)] bg-[var(--brand-primary)] px-4 py-3 text-[var(--text-inverse)] shadow-[var(--shadow-float)]">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] opacity-80">
                    Sepetiniz ({totalSelectedCount} ürün)
                  </p>
                  <div className="text-base font-bold">
                    <RollingPrice value={totalSelectedPrice} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectionList([])}
                className="rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium active:scale-95"
              >
                Temizle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Bottom Sheet + Data-Driven Smart Pairing */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-40 bg-[var(--bg-overlay)] backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-1/2 z-50 max-h-[90vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-t-[32px] border-t border-[var(--border-strong)] bg-[var(--bg-card)] pb-7 shadow-2xl"
            >
              {/* 3D Hero Image */}
              <div className="relative h-64 w-full overflow-hidden bg-[var(--bg-elevated)]">
                <img
                  src={selectedProduct.media_url}
                  alt={selectedProduct.name}
                  className={`${getMotionClass(
                    selectedProduct.motion_style
                  )} h-full w-full object-cover`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" />

                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md active:scale-95"
                  aria-label="Kapat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="px-5 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif-display text-2xl font-semibold text-[var(--text-primary)]">
                      {selectedProduct.name}
                    </h3>
                    {selectedProduct.portion && (
                      <p className="mt-0.5 text-xs font-medium text-[var(--brand-accent)]">
                        {selectedProduct.portion}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xl font-bold text-[var(--text-primary)]">
                    {selectedProduct.price} ₺
                  </span>
                </div>

                {/* Meta Chips */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                    {selectedProduct.prep_time}
                  </span>
                  {selectedProduct.calories && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1">
                      <Flame className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                      {selectedProduct.calories}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {selectedProduct.description}
                </p>

                {/* Ingredients */}
                {selectedProduct.ingredients &&
                  selectedProduct.ingredients.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                        İçindekiler
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {selectedProduct.ingredients.map((ing) => (
                          <span
                            key={ing}
                            className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-card-soft)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Allergens */}
                {selectedProduct.allergens.length > 0 && (
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Alerjenler:
                    </span>
                    {selectedProduct.allergens.map((a) => (
                      <span
                        key={a}
                        className="rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]"
                      >
                        {ALLERGEN_LABELS[a].label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Primary Add Button */}
                <button
                  type="button"
                  onClick={() => addToSelection(selectedProduct)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] py-3.5 text-sm font-semibold text-[var(--text-inverse)] shadow-lg active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Sepete Ekle · {selectedProduct.price} ₺
                </button>

                {/* Data-Driven Smart Pairing Engine */}
                {smartPairing && (
                  <div className="mt-5 rounded-3xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Veri Odaklı Eşleştirme
                      </span>
                      <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--brand-accent)]">
                        %{smartPairing.matchRate} Birlikte Tercih
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
                      {smartPairing.reason}
                    </p>

                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5">
                      <img
                        src={smartPairing.product.media_url}
                        alt={smartPairing.product.name}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif-display truncate text-sm font-semibold text-[var(--text-primary)]">
                          {smartPairing.product.name}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold text-[var(--brand-accent)]">
                          {smartPairing.product.price} ₺
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedProduct(smartPairing.product)
                          }
                          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2 text-[11px] font-medium text-[var(--text-primary)] active:scale-95"
                        >
                          İncele
                        </button>
                        <button
                          type="button"
                          onClick={() => addToSelection(smartPairing.product)}
                          className="flex items-center gap-1 rounded-xl bg-[var(--brand-primary)] px-2.5 py-2 text-[11px] font-semibold text-[var(--text-inverse)] active:scale-95"
                        >
                          <Plus className="h-3 w-3" />
                          Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Masa 12 Aksiyon Menüsü */}
      <TableActionsMenu
        venue={venue}
        tableNumber={tableNumber}
        tableSlug={tableSlug}
        remainingBill={remainingBill}
        open={tableMenuOpen}
        onClose={() => setTableMenuOpen(false)}
        onOpenWaiter={() => setWaiterSheetOpen(true)}
      />

      <WaiterCallSheet
        venueId={venue.id}
        tableNumber={tableNumber}
        open={waiterSheetOpen}
        onClose={() => setWaiterSheetOpen(false)}
      />

      <FlavorWheelModal
        open={wheelOpen}
        onClose={() => setWheelOpen(false)}
      />

      {/* Added Toast */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--brand-primary)] px-4 py-2 text-xs font-medium text-[var(--text-inverse)] shadow-xl"
          >
            <Check className="h-3.5 w-3.5" />
            {addedToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
