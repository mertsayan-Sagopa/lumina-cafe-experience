export type AllergenKey = "sut" | "gluten" | "yumurta" | "findik" | "soya";

export interface Venue {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  address: string;
  primary_color: string;
  accent_color: string;
  google_review_url: string;
  instagram_url: string;
  tiktok_url: string;
  spotify_url: string;
}

export interface Category {
  id: string;
  venue_id: string;
  name: string;
  subtitle: string;
  sort_order: number;
  group?: "icecek" | "yiyecek" | "tatli" | "paketli";
}

export interface CoPurchaseStat {
  product_id: string;
  order_count: number;
  match_rate: number; // Percentage of guests who ordered both together (0-100)
  reason: string;
}

export interface ProductOption {
  label: string;
  choices: string[];
}

export interface Product {
  id: string;
  venue_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  prep_time: string;
  media_url: string;
  motion_style: "zoom" | "pan" | "float";
  allergens: AllergenKey[];
  paired_product_id?: string;
  pairing_note?: string;
  badge?: string;
  calories?: string;
  is_signature?: boolean;
  portion?: string;
  tasting_notes?: string[];
  ingredients?: string[];
  popularity_score?: number;
  co_purchase_stats?: CoPurchaseStat[];
  options?: ProductOption;
  subcategory?: string;
  model_3d_url?: string;
}

export interface SharedCartItem {
  id: string;
  product: Product;
  qty: number;
  selectedOption?: string;
  addedBy: string;
}

export type LiveOrderStage = "received" | "preparing" | "serving";

export interface LiveOrderStatus {
  id: string;
  venue_id: string;
  table_number: number;
  status: LiveOrderStage;
  estimated_minutes: number;
  items: SharedCartItem[];
  total_amount: number;
  created_at: string;
}

export type ServiceRequestType = "waiter" | "bill" | "water";

export interface ServiceRequest {
  id: string;
  venue_id: string;
  table_number: number;
  type: ServiceRequestType;
  status: "pending" | "completed";
  created_at: string;
}

export interface CustomerWish {
  id: string;
  venue_id: string;
  table_number: number;
  category: "yeni-urun" | "diyet" | "atmosfer" | "diger";
  message: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  is_paid: boolean;
}

export interface DemoOrder {
  id: string;
  venue_id: string;
  table_number: number;
  items: OrderItem[];
  total_amount: number;
}

export interface Feedback {
  id: string;
  venue_id: string;
  table_number: number;
  rating: number;
  comment: string;
  redirected_to_google: boolean;
  created_at: string;
}

export interface TipRecord {
  id: string;
  venue_id: string;
  table_number: number;
  amount: number;
  department: "barista" | "kitchen" | "service";
  note: string;
  created_at: string;
}

export interface GiftCard {
  id: string;
  venue_id: string;
  code: string;
  amount: number;
  package_name: string;
  sender_name: string;
  message: string;
  is_redeemed: boolean;
  created_at: string;
}
