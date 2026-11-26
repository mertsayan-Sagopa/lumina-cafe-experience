"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
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
import {
  addToSharedCart,
  getDemoOrder,
  getLiveOrder,
  getSharedCart,
  subscribeRealtime,
} from "@/lib/realtime-store";
import { LiveOrderStatus, Product, SharedCartItem, Venue } from "@/lib/types";
import CustomerRequestTab from "./CustomerRequestTab";
import FlavorWheelModal from "./FlavorWheelModal";
import LiveOrderBanner from "./LiveOrderBanner";
import RollingPrice from "./RollingPrice";
import SharedCartSheet from "./SharedCartSheet";
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
  const [activeTab, setActiveTab] = useState<string>(TAB_RECOMMENDED);
  // Compact layout mode: "list" (5-6 items/screen) or "grid" (2-column compact grid)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quickOptionProductId, setQuickOptionProductId] = useState<
    string | null
  >(null);
  const [detailOption, setDetailOption] = useState<string | undefined>(
    undefined
  );
  const [sharedCart, setSharedCart] = useState<SharedCartItem[]>([]);
  const [liveOrder, setLiveOrder] = useState<LiveOrderStatus | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [waiterSheetOpen, setWaiterSheetOpen] = useState(false);
  const [cartSheetOpen, setCartSheetOpen] = useState(false);
  const [wheelOpen, setWheelOpen] = useState(false);
  const [remainingBill, setRemainingBill] = useState<number>(1095);

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

  const signatureProducts = useMemo(() => getSignatureProducts(), []);

  const filteredProducts = useMemo(() => {
    if (activeTab === TAB_RECOMMENDED) return signatureProducts;
    if (activeTab === TAB_WISHES) return [];
    return DEMO_PRODUCTS.filter((p) => p.category_id === activeTab);
  }, [activeTab, signatureProducts]);

  const cartProductIds = useMemo(
    () => sharedCart.map((i) => i.product.id),
    [sharedCart]
  );

  const smartPairing = useMemo(
    () => getDataDrivenPairing(selectedProduct, cartProductIds),
    [selectedProduct, cartProductIds]
  );

  const totalSelectedCount = useMemo(
    () => sharedCart.reduce((acc, item) => acc + item.qty, 0),
    [sharedCart]
  );

  const totalSelectedPrice = useMemo(
    () =>
      sharedCart.reduce((acc, item) => acc + item.product.price * item.qty, 0),
    [sharedCart]
  );

  const handleAddToCart = (product: Product, option?: string) => {
    addToSharedCart(venue.id, tableNumber, product, option, "Sen");
    syncAll();
    setQuickOptionProductId(null);
    const label = option
      ? `${product.name} (${option}) eklendi`
      : `${product.name} sepete eklendi`;
    setAddedToast(label);
    window.setTimeout(() => {
      setAddedToast((prev) => (prev === label ? null : prev));
    }, 2000);
  };

  const handleQuickAddClick = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    if (product.options && product.options.choices.length > 0) {
      setQuickOptionProductId((prev) =>
        prev === product.id ? null : product.id
      );
    } else {
      handleAddToCart(product);
    }
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailOption(product.options?.choices[0]);
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
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-glass)] backdrop-blur-xl">
        <div className="grid grid-cols-3 items-center px-4 py-3">
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
              className="relative flex items-center gap-1.5 rounded-full bg-[var(--brand-primary)] px-3.5 py-2 text-xs font-semibold text-[var(--text-inverse)] shadow-md ring-2 ring-[var(--brand-accent)]/35 active:scale-95"
            >
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              <span>Masa {tableNumber}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              {totalSelectedCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--brand-accent)] px-1 text-[10px] font-bold text-white shadow">
                  {totalSelectedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sticky Horizontal Category Tabs */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2.5 pt-0.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
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

      {/* Live Order Status Banner */}
      {liveOrder && (
        <div className="px-4 pt-3">
          <LiveOrderBanner order={liveOrder} />
        </div>
      )}

      {/* Main Content Area */}
      {activeTab === TAB_WISHES ? (
        <div className="px-4 pt-4">
          <CustomerRequestTab venueId={venue.id} tableNumber={tableNumber} />
        </div>
      ) : (
        <>
          {/* Section Header + Compact View Mode Toggle (Yatay Satır / 2'li Izgara) */}
          <div className="px-4 pb-2 pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-serif-display truncate text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {activeTab === TAB_RECOMMENDED
                    ? "Önerilenler"
                    : activeCategoryMeta?.name}
                </h2>
                <p className="truncate text-[11px] text-[var(--text-secondary)]">
                  {activeTab === TAB_RECOMMENDED
                    ? "İmza lezzetler · 3D görselli menü"
                    : activeCategoryMeta?.subtitle}
                </p>
              </div>

              {/* Layout Toggle */}
              <div className="flex shrink-0 items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-label="Kompakt Yatay Liste"
                  className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                    viewMode === "list"
                      ? "bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  <span>Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-label="2'li Kompakt Izgara"
                  className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                    viewMode === "grid"
                      ? "bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>2&apos;li</span>
                </button>
              </div>
            </div>
          </div>

          {/* COMPACT HORIZONTAL ROW LAYOUT (5-6 products visible on 1 screen) */}
          {viewMode === "list" ? (
            <div className="space-y-2.5 px-4 pt-2">
              {filteredProducts.map((product) => {
                const isOptionOpen = quickOptionProductId === product.id;

                return (
                  <motion.article
                    key={product.id}
                    layout
                    onClick={() => openProductDetail(product)}
                    className="cursor-pointer overflow-hidden rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 shadow-sm transition-colors hover:border-[var(--brand-accent)]"
                  >
                    <div className="flex items-center gap-3">
                      {/* Compact Square 3D Visual */}
                      <div className="relative h-[74px] w-[74px] shrink-0 overflow-hidden rounded-2xl bg-[var(--bg-elevated)]">
                        <img
                          src={product.media_url}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 inline-flex items-center gap-0.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
                          <Clock className="h-2.5 w-2.5 text-[#e5d4b8]" />
                          {product.prep_time}
                        </span>
                      </div>

                      {/* Middle Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {product.subcategory && (
                            <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                              {product.subcategory}
                            </span>
                          )}
                          {product.badge && (
                            <span className="shrink-0 rounded-full bg-[var(--brand-soft)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--brand-accent)]">
                              {product.badge}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif-display truncate text-sm font-semibold text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                          {product.description}
                        </p>
                      </div>

                      {/* Right Price & Quick +Ekle */}
                      <div className="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {product.price} ₺
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleQuickAddClick(e, product)}
                          className="inline-flex items-center gap-0.5 rounded-full bg-[var(--brand-primary)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--text-inverse)] shadow-sm active:scale-95"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Quick Option Selector */}
                    <AnimatePresence>
                      {isOptionOpen && product.options && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2.5 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2.5"
                        >
                          <p className="mb-1.5 text-[10px] font-semibold text-[var(--text-primary)]">
                            {product.options.label}:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {product.options.choices.map((choice) => (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => handleAddToCart(product, choice)}
                                className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-primary)] hover:border-[var(--brand-accent)] active:scale-95"
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </div>
          ) : (
            /* 2-COLUMN COMPACT GRID LAYOUT */
            <div className="grid grid-cols-2 gap-3 px-4 pt-2">
              {filteredProducts.map((product) => {
                const isOptionOpen = quickOptionProductId === product.id;

                return (
                  <motion.article
                    key={product.id}
                    layout
                    onClick={() => openProductDetail(product)}
                    className={`flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm transition-colors hover:border-[var(--brand-accent)] ${
                      isOptionOpen ? "col-span-2" : ""
                    }`}
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-[var(--bg-elevated)]">
                      <img
                        src={product.media_url}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-md">
                        <Clock className="h-2.5 w-2.5 text-[#e5d4b8]" />
                        {product.prep_time}
                      </span>
                      <span className="absolute bottom-2 right-2 rounded-xl bg-[#2c1e16]/90 px-2 py-0.5 text-xs font-semibold text-[#f7f3ec] backdrop-blur-md">
                        {product.price} ₺
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-2.5">
                      <div>
                        {product.subcategory && (
                          <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-[var(--brand-accent)]">
                            {product.subcategory}
                          </p>
                        )}
                        <h3 className="font-serif-display line-clamp-1 text-xs font-semibold text-[var(--text-primary)]">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 line-clamp-1 text-[10px] text-[var(--text-secondary)]">
                          {product.description}
                        </p>
                      </div>

                      {/* Inline Options for Grid */}
                      <AnimatePresence>
                        {isOptionOpen && product.options && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 overflow-hidden rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] p-2"
                          >
                            <p className="mb-1.5 text-[10px] font-semibold text-[var(--text-primary)]">
                              {product.options.label}:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {product.options.choices.map((choice) => (
                                <button
                                  key={choice}
                                  type="button"
                                  onClick={() =>
                                    handleAddToCart(product, choice)
                                  }
                                  className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] px-2 py-1 text-[10px] font-medium text-[var(--text-primary)] active:scale-95"
                                >
                                  {choice}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="mt-2.5 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAddClick(e, product)}
                          className="inline-flex items-center gap-0.5 rounded-full bg-[var(--brand-primary)] px-2.5 py-1 text-[10px] font-semibold text-[var(--text-inverse)] shadow-sm active:scale-95"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Ekle</span>
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Clickable Floating Shared Cart Summary Bar */}
      <AnimatePresence>
        {totalSelectedCount > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            className="fixed bottom-4 left-1/2 z-30 w-[92%] max-w-md -translate-x-1/2"
          >
            <button
              type="button"
              onClick={() => setCartSheetOpen(true)}
              className="flex w-full items-center justify-between rounded-[22px] border border-[var(--border-strong)] bg-[var(--brand-primary)] px-4 py-3 text-left text-[var(--text-inverse)] shadow-[var(--shadow-float)] transition-transform active:scale-[0.985]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] opacity-85">
                    Ortak Masa Sepeti ({totalSelectedCount} ürün)
                  </p>
                  <div className="text-base font-bold">
                    <RollingPrice value={totalSelectedPrice} />
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold">
                Sepeti Gör
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Detail Bottom Sheet (No Calories, 3D Ready) */}
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
              <div className="relative h-60 w-full overflow-hidden bg-[var(--bg-elevated)]">
                <img
                  src={selectedProduct.media_url}
                  alt={selectedProduct.name}
                  className={`${getMotionClass(
                    selectedProduct.motion_style
                  )} h-full w-full object-cover`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25" />

                <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-[#f7f3ec] backdrop-blur-md">
                  <Box className="h-3 w-3 text-[#e5d4b8]" />
                  3D Görsel
                </span>

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

                {/* Prep Time Chip Only (No Calories) */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2.5 py-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--brand-accent)]" />
                    Hazırlanma: {selectedProduct.prep_time}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {selectedProduct.description}
                </p>

                {/* Options Selector inside Detail Sheet */}
                {selectedProduct.options && (
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                      {selectedProduct.options.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProduct.options.choices.map((choice) => {
                        const active = detailOption === choice;
                        return (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setDetailOption(choice)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                              active
                                ? "bg-[var(--brand-primary)] text-[var(--text-inverse)]"
                                : "border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]"
                            }`}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

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
                  onClick={() =>
                    handleAddToCart(selectedProduct, detailOption)
                  }
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
                          onClick={() => openProductDetail(smartPairing.product)}
                          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2.5 py-2 text-[11px] font-medium text-[var(--text-primary)] active:scale-95"
                        >
                          İncele
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddToCart(smartPairing.product)}
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
        cartCount={totalSelectedCount}
        open={tableMenuOpen}
        onClose={() => setTableMenuOpen(false)}
        onOpenWaiter={() => setWaiterSheetOpen(true)}
        onOpenCart={() => setCartSheetOpen(true)}
      />

      {/* Ortak Masa Sepeti Çekmecesi */}
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
