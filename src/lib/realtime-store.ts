"use client";

import { INITIAL_DEMO_ORDER } from "./demo-data";
import {
  CustomerWish,
  DemoOrder,
  Feedback,
  GiftCard,
  LiveOrderStage,
  LiveOrderStatus,
  Product,
  ServiceRequest,
  ServiceRequestType,
  SharedCartItem,
  TipRecord,
} from "./types";

const CHANNEL_NAME = "lumina_realtime_v1";
const STORAGE_KEY_REQUESTS = "lumina_service_requests_v1";
const STORAGE_KEY_ORDERS = "lumina_demo_orders_v1";
const STORAGE_KEY_TIPS = "lumina_tips_v1";
const STORAGE_KEY_GIFT_CARDS = "lumina_gift_cards_v1";
const STORAGE_KEY_FEEDBACKS = "lumina_feedbacks_v1";
const STORAGE_KEY_WISHES = "lumina_customer_wishes_v1";
const STORAGE_KEY_SHARED_CART = "lumina_shared_cart_v1";
const STORAGE_KEY_LIVE_ORDER = "lumina_live_order_v1";

type Listener = () => void;

export type RealtimeEvent =
  | { eventType: "NEW_SERVICE_REQUEST"; payload: ServiceRequest }
  | { eventType: "UPDATE_SERVICE_REQUEST"; payload: { requestId: string } }
  | { eventType: "CLEAR_COMPLETED" }
  | { eventType: "ORDER_UPDATED"; payload: { tableNumber: number } }
  | { eventType: "NEW_TIP"; payload: TipRecord }
  | { eventType: "GIFT_CARD_UPDATED"; payload: GiftCard }
  | { eventType: "NEW_FEEDBACK"; payload: Feedback }
  | { eventType: "NEW_CUSTOMER_WISH"; payload: CustomerWish }
  | { eventType: "SHARED_CART_UPDATED"; payload: { tableNumber: number } }
  | { eventType: "LIVE_ORDER_UPDATED"; payload: { tableNumber: number } };

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

function broadcastUpdate(event: RealtimeEvent) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ ...event, ts: Date.now() });
    channel.close();
  } catch {
    // ignore
  }
}

/* ==================== SERVICE REQUESTS ==================== */

export function getServiceRequests(venueId: string): ServiceRequest[] {
  return readJSON<ServiceRequest[]>(STORAGE_KEY_REQUESTS, [])
    .filter((r) => r.venue_id === venueId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createServiceRequest(
  venueId: string,
  tableNumber: number,
  type: ServiceRequestType
): ServiceRequest {
  const newReq: ServiceRequest = {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    venue_id: venueId,
    table_number: tableNumber,
    type,
    status: "pending",
    created_at: new Date().toISOString(),
  };

  const current = readJSON<ServiceRequest[]>(STORAGE_KEY_REQUESTS, []);
  writeJSON(STORAGE_KEY_REQUESTS, [newReq, ...current]);
  broadcastUpdate({ eventType: "NEW_SERVICE_REQUEST", payload: newReq });
  return newReq;
}

export function completeServiceRequest(requestId: string): void {
  const current = readJSON<ServiceRequest[]>(STORAGE_KEY_REQUESTS, []);
  const updated = current.map((r) =>
    r.id === requestId ? { ...r, status: "completed" as const } : r
  );
  writeJSON(STORAGE_KEY_REQUESTS, updated);
  broadcastUpdate({ eventType: "UPDATE_SERVICE_REQUEST", payload: { requestId } });
}

export function clearCompletedRequests(venueId: string): void {
  const current = readJSON<ServiceRequest[]>(STORAGE_KEY_REQUESTS, []);
  const remaining = current.filter(
    (r) => !(r.venue_id === venueId && r.status === "completed")
  );
  writeJSON(STORAGE_KEY_REQUESTS, remaining);
  broadcastUpdate({ eventType: "CLEAR_COMPLETED" });
}

/* ==================== DEMO ORDERS (SPLIT BILL) ==================== */

export function getDemoOrder(venueId: string, tableNumber: number): DemoOrder {
  const all = readJSON<Record<string, DemoOrder>>(STORAGE_KEY_ORDERS, {});
  const key = `${venueId}_${tableNumber}`;
  if (all[key]) return all[key];

  const fresh: DemoOrder = {
    ...INITIAL_DEMO_ORDER,
    id: `order-${venueId}-${tableNumber}`,
    venue_id: venueId,
    table_number: tableNumber,
    items: INITIAL_DEMO_ORDER.items.map((item) => ({ ...item })),
  };
  all[key] = fresh;
  writeJSON(STORAGE_KEY_ORDERS, all);
  return fresh;
}

export function payOrderItems(
  venueId: string,
  tableNumber: number,
  itemIds: string[]
): DemoOrder {
  const all = readJSON<Record<string, DemoOrder>>(STORAGE_KEY_ORDERS, {});
  const key = `${venueId}_${tableNumber}`;
  const order = getDemoOrder(venueId, tableNumber);

  const updatedItems = order.items.map((item) =>
    itemIds.includes(item.id) ? { ...item, is_paid: true } : item
  );
  const updatedOrder: DemoOrder = { ...order, items: updatedItems };
  all[key] = updatedOrder;
  writeJSON(STORAGE_KEY_ORDERS, all);
  broadcastUpdate({ eventType: "ORDER_UPDATED", payload: { tableNumber } });
  return updatedOrder;
}

export function payEqualSplit(
  venueId: string,
  tableNumber: number,
  amount: number
): DemoOrder {
  const all = readJSON<Record<string, DemoOrder>>(STORAGE_KEY_ORDERS, {});
  const key = `${venueId}_${tableNumber}`;
  const order = getDemoOrder(venueId, tableNumber);

  // Add a negative paid entry or mark remaining items if fully covered
  const unpaidTotal = order.items
    .filter((i) => !i.is_paid)
    .reduce((sum, i) => sum + i.price, 0);

  let updatedItems = [...order.items];
  if (amount >= unpaidTotal - 1) {
    updatedItems = updatedItems.map((i) => ({ ...i, is_paid: true }));
  } else {
    updatedItems.push({
      id: `split-${Date.now()}`,
      product_id: "split-payment",
      name: "Eşit Bölüşüm Ödemesi",
      price: -Math.round(amount),
      is_paid: false,
    });
  }

  const updatedOrder: DemoOrder = { ...order, items: updatedItems };
  all[key] = updatedOrder;
  writeJSON(STORAGE_KEY_ORDERS, all);
  broadcastUpdate({ eventType: "ORDER_UPDATED", payload: { tableNumber } });
  return updatedOrder;
}

export function resetDemoOrder(venueId: string, tableNumber: number): DemoOrder {
  const all = readJSON<Record<string, DemoOrder>>(STORAGE_KEY_ORDERS, {});
  const key = `${venueId}_${tableNumber}`;
  const fresh: DemoOrder = {
    ...INITIAL_DEMO_ORDER,
    id: `order-${venueId}-${tableNumber}`,
    venue_id: venueId,
    table_number: tableNumber,
    items: INITIAL_DEMO_ORDER.items.map((item) => ({ ...item, is_paid: false })),
  };
  all[key] = fresh;
  writeJSON(STORAGE_KEY_ORDERS, all);
  broadcastUpdate({ eventType: "ORDER_UPDATED", payload: { tableNumber } });
  return fresh;
}

/* ==================== TIPS ==================== */

export function getTips(venueId: string): TipRecord[] {
  return readJSON<TipRecord[]>(STORAGE_KEY_TIPS, [])
    .filter((t) => t.venue_id === venueId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createTip(
  venueId: string,
  tableNumber: number,
  amount: number,
  department: TipRecord["department"],
  note: string
): TipRecord {
  const tip: TipRecord = {
    id: `tip-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    venue_id: venueId,
    table_number: tableNumber,
    amount,
    department,
    note: note.trim(),
    created_at: new Date().toISOString(),
  };
  const current = readJSON<TipRecord[]>(STORAGE_KEY_TIPS, []);
  writeJSON(STORAGE_KEY_TIPS, [tip, ...current]);
  broadcastUpdate({ eventType: "NEW_TIP", payload: tip });
  return tip;
}

/* ==================== GIFT CARDS ==================== */

function generateGiftCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getGiftCards(venueId: string): GiftCard[] {
  return readJSON<GiftCard[]>(STORAGE_KEY_GIFT_CARDS, [])
    .filter((g) => g.venue_id === venueId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createGiftCard(
  venueId: string,
  amount: number,
  packageName: string,
  senderName: string,
  message: string
): GiftCard {
  const card: GiftCard = {
    id: `gc-${Date.now()}`,
    venue_id: venueId,
    code: generateGiftCode(),
    amount,
    package_name: packageName,
    sender_name: senderName.trim() || "Lumina Misafiri",
    message: message.trim() || "Afiyet olsun!",
    is_redeemed: false,
    created_at: new Date().toISOString(),
  };
  const current = readJSON<GiftCard[]>(STORAGE_KEY_GIFT_CARDS, []);
  writeJSON(STORAGE_KEY_GIFT_CARDS, [card, ...current]);
  broadcastUpdate({ eventType: "GIFT_CARD_UPDATED", payload: card });
  return card;
}

export function findGiftCardByCode(
  venueId: string,
  code: string
): GiftCard | undefined {
  const normalized = code.trim().toUpperCase();
  return getGiftCards(venueId).find((g) => g.code === normalized);
}

export function redeemGiftCard(venueId: string, code: string): GiftCard | null {
  const normalized = code.trim().toUpperCase();
  const current = readJSON<GiftCard[]>(STORAGE_KEY_GIFT_CARDS, []);
  let redeemed: GiftCard | null = null;

  const updated = current.map((g) => {
    if (g.venue_id === venueId && g.code === normalized) {
      redeemed = { ...g, is_redeemed: true };
      return redeemed;
    }
    return g;
  });

  if (redeemed) {
    writeJSON(STORAGE_KEY_GIFT_CARDS, updated);
    broadcastUpdate({ eventType: "GIFT_CARD_UPDATED", payload: redeemed });
  }
  return redeemed;
}

/* ==================== FEEDBACKS (REPUTATION SHIELD) ==================== */

export function getFeedbacks(venueId: string): Feedback[] {
  return readJSON<Feedback[]>(STORAGE_KEY_FEEDBACKS, [])
    .filter((f) => f.venue_id === venueId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createFeedback(
  venueId: string,
  tableNumber: number,
  rating: number,
  comment: string,
  redirectedToGoogle: boolean
): Feedback {
  const fb: Feedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    venue_id: venueId,
    table_number: tableNumber,
    rating,
    comment: comment.trim(),
    redirected_to_google: redirectedToGoogle,
    created_at: new Date().toISOString(),
  };
  const current = readJSON<Feedback[]>(STORAGE_KEY_FEEDBACKS, []);
  writeJSON(STORAGE_KEY_FEEDBACKS, [fb, ...current]);
  broadcastUpdate({ eventType: "NEW_FEEDBACK", payload: fb });
  return fb;
}

/* ==================== SUBSCRIPTION ==================== */

export function subscribeRealtime(
  onUpdate: Listener,
  onEvent?: (event: RealtimeEvent) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (
      e.key === STORAGE_KEY_REQUESTS ||
      e.key === STORAGE_KEY_ORDERS ||
      e.key === STORAGE_KEY_TIPS ||
      e.key === STORAGE_KEY_GIFT_CARDS ||
      e.key === STORAGE_KEY_FEEDBACKS
    ) {
      onUpdate();
    }
  };

  window.addEventListener("storage", handleStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (msg) => {
      onUpdate();
      if (onEvent && msg.data?.eventType) {
        onEvent(msg.data as RealtimeEvent);
      }
    };
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    if (channel) channel.close();
  };
}

/* ==================== CUSTOMER WISHES (TALEP SEKMESİ) ==================== */

export function getCustomerWishes(venueId: string): CustomerWish[] {
  return readJSON<CustomerWish[]>(STORAGE_KEY_WISHES, [])
    .filter((w) => w.venue_id === venueId)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
}

export function createCustomerWish(
  venueId: string,
  tableNumber: number,
  category: CustomerWish["category"],
  message: string
): CustomerWish {
  const wish: CustomerWish = {
    id: `wish-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    venue_id: venueId,
    table_number: tableNumber,
    category,
    message: message.trim(),
    created_at: new Date().toISOString(),
  };

  const current = readJSON<CustomerWish[]>(STORAGE_KEY_WISHES, []);
  writeJSON(STORAGE_KEY_WISHES, [wish, ...current]);
  broadcastUpdate({ eventType: "NEW_CUSTOMER_WISH", payload: wish });
  return wish;
}

/* ==================== SHARED TABLE CART (ORTAK MASA SEPETİ) ==================== */

export function getSharedCart(
  venueId: string,
  tableNumber: number
): SharedCartItem[] {
  const all = readJSON<Record<string, SharedCartItem[]>>(
    STORAGE_KEY_SHARED_CART,
    {}
  );
  return all[`${venueId}_${tableNumber}`] ?? [];
}

export function addToSharedCart(
  venueId: string,
  tableNumber: number,
  product: Product,
  selectedOption?: string,
  addedBy: string = "Sen"
): SharedCartItem[] {
  const all = readJSON<Record<string, SharedCartItem[]>>(
    STORAGE_KEY_SHARED_CART,
    {}
  );
  const key = `${venueId}_${tableNumber}`;
  const current = all[key] ?? [];

  const existing = current.find(
    (item) =>
      item.product.id === product.id &&
      (item.selectedOption ?? "") === (selectedOption ?? "") &&
      item.addedBy === addedBy
  );

  const updated = existing
    ? current.map((item) =>
        item.id === existing.id ? { ...item, qty: item.qty + 1 } : item
      )
    : [
        ...current,
        {
          id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          product,
          qty: 1,
          selectedOption,
          addedBy,
        },
      ];

  all[key] = updated;
  writeJSON(STORAGE_KEY_SHARED_CART, all);
  broadcastUpdate({ eventType: "SHARED_CART_UPDATED", payload: { tableNumber } });
  return updated;
}

export function updateSharedCartItemQty(
  venueId: string,
  tableNumber: number,
  itemId: string,
  delta: number
): SharedCartItem[] {
  const all = readJSON<Record<string, SharedCartItem[]>>(
    STORAGE_KEY_SHARED_CART,
    {}
  );
  const key = `${venueId}_${tableNumber}`;
  const current = all[key] ?? [];

  const updated = current
    .map((item) =>
      item.id === itemId ? { ...item, qty: item.qty + delta } : item
    )
    .filter((item) => item.qty > 0);

  all[key] = updated;
  writeJSON(STORAGE_KEY_SHARED_CART, all);
  broadcastUpdate({ eventType: "SHARED_CART_UPDATED", payload: { tableNumber } });
  return updated;
}

export function removeSharedCartItem(
  venueId: string,
  tableNumber: number,
  itemId: string
): SharedCartItem[] {
  const all = readJSON<Record<string, SharedCartItem[]>>(
    STORAGE_KEY_SHARED_CART,
    {}
  );
  const key = `${venueId}_${tableNumber}`;
  const current = all[key] ?? [];
  const updated = current.filter((item) => item.id !== itemId);

  all[key] = updated;
  writeJSON(STORAGE_KEY_SHARED_CART, all);
  broadcastUpdate({ eventType: "SHARED_CART_UPDATED", payload: { tableNumber } });
  return updated;
}

/* ==================== LIVE ORDER STATUS (CANLI SİPARİŞ DURUMU) ==================== */

export function getLiveOrder(
  venueId: string,
  tableNumber: number
): LiveOrderStatus | null {
  const all = readJSON<Record<string, LiveOrderStatus | null>>(
    STORAGE_KEY_LIVE_ORDER,
    {}
  );
  return all[`${venueId}_${tableNumber}`] ?? null;
}

export function submitSharedOrder(
  venueId: string,
  tableNumber: number
): LiveOrderStatus | null {
  const cart = getSharedCart(venueId, tableNumber);
  if (cart.length === 0) return null;

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const maxPrep = Math.max(
    6,
    ...cart.map((item) => parseInt(item.product.prep_time, 10) || 6)
  );

  const liveOrder: LiveOrderStatus = {
    id: `live-${Date.now()}`,
    venue_id: venueId,
    table_number: tableNumber,
    status: "preparing",
    estimated_minutes: maxPrep,
    items: cart,
    total_amount: totalAmount,
    created_at: new Date().toISOString(),
  };

  // Save live order
  const allOrders = readJSON<Record<string, LiveOrderStatus | null>>(
    STORAGE_KEY_LIVE_ORDER,
    {}
  );
  allOrders[`${venueId}_${tableNumber}`] = liveOrder;
  writeJSON(STORAGE_KEY_LIVE_ORDER, allOrders);

  // Clear shared cart after order is sent to kitchen
  const allCarts = readJSON<Record<string, SharedCartItem[]>>(
    STORAGE_KEY_SHARED_CART,
    {}
  );
  allCarts[`${venueId}_${tableNumber}`] = [];
  writeJSON(STORAGE_KEY_SHARED_CART, allCarts);

  broadcastUpdate({ eventType: "SHARED_CART_UPDATED", payload: { tableNumber } });
  broadcastUpdate({ eventType: "LIVE_ORDER_UPDATED", payload: { tableNumber } });
  return liveOrder;
}

export function updateLiveOrderStage(
  venueId: string,
  tableNumber: number,
  status: LiveOrderStage,
  estimatedMinutes: number
): LiveOrderStatus | null {
  const allOrders = readJSON<Record<string, LiveOrderStatus | null>>(
    STORAGE_KEY_LIVE_ORDER,
    {}
  );
  const key = `${venueId}_${tableNumber}`;
  const current = allOrders[key];
  if (!current) return null;

  const updated: LiveOrderStatus = {
    ...current,
    status,
    estimated_minutes: estimatedMinutes,
  };
  allOrders[key] = updated;
  writeJSON(STORAGE_KEY_LIVE_ORDER, allOrders);
  broadcastUpdate({ eventType: "LIVE_ORDER_UPDATED", payload: { tableNumber } });
  return updated;
}

export function clearLiveOrder(venueId: string, tableNumber: number): void {
  const allOrders = readJSON<Record<string, LiveOrderStatus | null>>(
    STORAGE_KEY_LIVE_ORDER,
    {}
  );
  allOrders[`${venueId}_${tableNumber}`] = null;
  writeJSON(STORAGE_KEY_LIVE_ORDER, allOrders);
  broadcastUpdate({ eventType: "LIVE_ORDER_UPDATED", payload: { tableNumber } });
}
