import { AllergenKey, Category, DemoOrder, Product, Venue } from "./types";

export const ALLERGEN_LABELS: Record<AllergenKey, { label: string; short: string }> = {
  sut: { label: "Süt & Laktoz", short: "Süt" },
  gluten: { label: "Gluten", short: "Gluten" },
  yumurta: { label: "Yumurta", short: "Yumurta" },
  findik: { label: "Sert Kabuklu Yemiş", short: "Fındık" },
  soya: { label: "Soya", short: "Soya" },
};

export const DEMO_VENUE: Venue = {
  id: "venue-lumina-01",
  name: "Lumina",
  slug: "lumina",
  tagline: "Artisan Roastery & Modern Kitchen",
  address: "Moda Caddesi No: 42, Kadıköy / İstanbul",
  primary_color: "#2C1E16",
  accent_color: "#9E6B43",
  google_review_url: "https://g.page/r/lumina-coffee-bistro-demo/review",
  instagram_url: "https://instagram.com",
  tiktok_url: "https://tiktok.com",
  spotify_url: "https://open.spotify.com",
};

export const DEMO_CATEGORIES: Category[] = [
  {
    id: "cat-coffee",
    venue_id: DEMO_VENUE.id,
    name: "İmza Kahveler",
    subtitle: "Özel kavrum çekirdekler",
    sort_order: 1,
  },
  {
    id: "cat-dessert",
    venue_id: DEMO_VENUE.id,
    name: "Tatlılar",
    subtitle: "Günlük taze pastane",
    sort_order: 2,
  },
  {
    id: "cat-main",
    venue_id: DEMO_VENUE.id,
    name: "Ana Yemekler",
    subtitle: "Şefin sıcak mutfağı",
    sort_order: 3,
  },
  {
    id: "cat-cold",
    venue_id: DEMO_VENUE.id,
    name: "Soğuk İçecekler",
    subtitle: "Ferahlatıcı karışımlar",
    sort_order: 4,
  },
];

export const DEMO_PRODUCTS: Product[] = [
  // İmza Kahveler
  {
    id: "prod-latte",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-coffee",
    name: "Lumina Signature Latte",
    description:
      "Çift shot Etiyopya Yirgacheffe espresso, kadifemsi mikroköpük süt ve ev yapımı Madagascar vanilya dokunuşu.",
    price: 165,
    prep_time: "4 dk",
    media_url: "/images/products/latte-3d.jpg",
    motion_style: "zoom",
    allergens: ["sut"],
    paired_product_id: "prod-sansebastian",
    pairing_note:
      "Bu kahveyi seçen misafirlerin %84'ü yanında akışkan San Sebastian Cheesecake tercih etti.",
    badge: "İmza Lezzet",
    calories: "190 kcal",
    is_signature: true,
    portion: "280 ml · Double Shot",
    tasting_notes: ["Madagascar Vanilya", "Karamel", "İpeksi Mikro Köpük"],
    ingredients: ["Etiyopya Yirgacheffe Espresso", "Günlük Çiftlik Sütü", "Ev Yapımı Vanilya Özütü"],
    popularity_score: 98,
    options: {
      label: "Süt Seçimi",
      choices: ["Normal Süt", "Yulaf Sütü", "Badem Sütü", "Laktozsuz"],
    },
    co_purchase_stats: [
      {
        product_id: "prod-sansebastian",
        order_count: 412,
        match_rate: 84,
        reason: "Misafirlerin %84'ü bu kahvenin yanında San Sebastian Cheesecake sipariş etti.",
      },
      {
        product_id: "prod-croissant",
        order_count: 238,
        match_rate: 62,
        reason: "Sabah saatlerinde en çok Taze Fransız Kruvasan ile birlikte tercih ediliyor.",
      },
    ],
  },
  {
    id: "prod-v60",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-coffee",
    name: "V60 Pour Over (Colombia)",
    description:
      "El yapımı demleme. Karamel, kırmızı meyveler ve hafif narenciye asiditesiyle berrak bir içim.",
    price: 175,
    prep_time: "6 dk",
    media_url: "/images/products/v60-3d.jpg",
    motion_style: "pan",
    allergens: [],
    paired_product_id: "prod-croissant",
    pairing_note:
      "V60 siparişlerinin %76'sı fırından yeni çıkan Taze Fransız Kruvasan ile eşleşiyor.",
    badge: "Single Origin",
    calories: "5 kcal",
    is_signature: false,
    portion: "250 ml · El Demleme",
    tasting_notes: ["Kırmızı Meyve", "Bergamot", "Temiz Bitiş"],
    ingredients: ["Colombia Huila Çekirdek", "92°C Arıtılmış Su"],
    popularity_score: 85,
    co_purchase_stats: [
      {
        product_id: "prod-croissant",
        order_count: 294,
        match_rate: 76,
        reason: "V60 tercih edenlerin %76'sı tereyağlı Taze Fransız Kruvasan ekledi.",
      },
      {
        product_id: "prod-tiramisu",
        order_count: 141,
        match_rate: 48,
        reason: "Öğleden sonra en çok Lumina Artisan Tiramisu ile birlikte sipariş ediliyor.",
      },
    ],
  },
  {
    id: "prod-cortado",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-coffee",
    name: "Amber Honey Cortado",
    description:
      "Yoğun double ristretto, eşit oranda ipeksi süt ve organik kestane balı ile dengelenmiş güçlü karakter.",
    price: 155,
    prep_time: "3 dk",
    media_url: "/images/products/cortado-3d.jpg",
    motion_style: "float",
    allergens: ["sut"],
    paired_product_id: "prod-tiramisu",
    pairing_note:
      "Cortado siparişlerinin %71'inde tatlı olarak Lumina Artisan Tiramisu tercih ediliyor.",
    calories: "120 kcal",
    is_signature: false,
    portion: "140 ml · Gibraltar",
    tasting_notes: ["Kestane Balı", "Bitter Kakao", "Yoğun Ristretto"],
    ingredients: ["Double Ristretto", "Sıcak Mikroköpük Süt", "Organik Kestane Balı"],
    popularity_score: 82,
    co_purchase_stats: [
      {
        product_id: "prod-tiramisu",
        order_count: 215,
        match_rate: 71,
        reason: "Misafirlerin %71'i yoğun ristrettoyu Lumina Artisan Tiramisu ile eşleştirdi.",
      },
    ],
  },

  // Tatlılar
  {
    id: "prod-sansebastian",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-dessert",
    name: "San Sebastian Cheesecake",
    description:
      "Dışı karamelize, içi akışkan klasik Bask cheesecake. Yanında sıcak Belçika sütlü çikolata sosu ile servis edilir.",
    price: 240,
    prep_time: "3 dk",
    media_url: "/images/products/sansebastian-3d.jpg",
    motion_style: "zoom",
    allergens: ["sut", "yumurta", "gluten"],
    paired_product_id: "prod-latte",
    pairing_note:
      "San Sebastian siparişlerinin %86'sı Lumina Signature Latte ile birlikte veriliyor.",
    badge: "Şefin İmzası",
    calories: "460 kcal",
    is_signature: true,
    portion: "180g · Sıcak Belçika Soslu",
    tasting_notes: ["Karamelize Kabuk", "Akışkan Krema", "Belçika Sütlü Çikolata"],
    ingredients: ["Mascarpone & Krem Peynir", "Gezen Tavuk Yumurtası", "Callebaut Sütlü Çikolata"],
    popularity_score: 97,
    co_purchase_stats: [
      {
        product_id: "prod-latte",
        order_count: 438,
        match_rate: 86,
        reason: "Bu tatlıyı alan misafirlerin %86'sı Lumina Signature Latte ile eşleştirdi.",
      },
      {
        product_id: "prod-v60",
        order_count: 185,
        match_rate: 54,
        reason: "Sade kahve sevenlerin %54'ü V60 Pour Over ile tercih ediyor.",
      },
    ],
  },
  {
    id: "prod-croissant",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-dessert",
    name: "Taze Fransız Kruvasan",
    description:
      "72 saat soğuk fermantasyon, %100 Fransız tereyağı ile kat kat çıtır dokulu fırından taze kruvasan.",
    price: 145,
    prep_time: "2 dk",
    media_url: "/images/products/croissant-3d.jpg",
    motion_style: "pan",
    allergens: ["gluten", "sut", "yumurta"],
    paired_product_id: "prod-v60",
    pairing_note:
      "Kruvasan siparişlerinin %74'ü V60 Pour Over ile birlikte alınıyor.",
    calories: "310 kcal",
    is_signature: false,
    portion: "95g · Fırından Taze",
    tasting_notes: ["Fransız Tereyağı", "Çıtır Katmanlar", "Hafif Bal Dokusu"],
    ingredients: ["Fransız T45 Unu", "%82 Yağlı Tereyağı", "Doğal Ekşi Maya"],
    popularity_score: 88,
    co_purchase_stats: [
      {
        product_id: "prod-v60",
        order_count: 276,
        match_rate: 74,
        reason: "Kruvasan sipariş edenlerin %74'ü V60 Pour Over ile güne başladı.",
      },
    ],
  },
  {
    id: "prod-tiramisu",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-dessert",
    name: "Lumina Artisan Tiramisu",
    description:
      "Kendi espresso harmanımızla ıslatılmış kedi dili, İtalyan mascarpone kreması ve bitter kakao.",
    price: 225,
    prep_time: "3 dk",
    media_url: "/images/products/tiramisu-3d.jpg",
    motion_style: "float",
    allergens: ["sut", "yumurta", "gluten"],
    paired_product_id: "prod-cortado",
    pairing_note:
      "Tiramisu siparişlerinin %69'u Amber Honey Cortado ile tamamlanıyor.",
    calories: "380 kcal",
    is_signature: false,
    portion: "165g · Günlük Hazırlık",
    tasting_notes: ["İtalyan Mascarpone", "Taze Espresso", "Valrhona Kakao"],
    ingredients: ["İtalyan Mascarpone", "Savoiardi Bisküvi", "Lumina Espresso", "Bitter Kakao"],
    popularity_score: 84,
    co_purchase_stats: [
      {
        product_id: "prod-cortado",
        order_count: 198,
        match_rate: 69,
        reason: "Tiramisu severlerin %69'u yanında Amber Honey Cortado tercih etti.",
      },
    ],
  },

  // Ana Yemekler
  {
    id: "prod-burger",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-main",
    name: "Lumina Trüf Smash Burger",
    description:
      "Çift 90g dry-aged dana köfte, eritilmiş cheddar, karamelize soğan, trüflü aioli sos ve brioche ekmek. Trüflü patates ile.",
    price: 390,
    prep_time: "14 dk",
    media_url: "/images/products/burger-3d.jpg",
    motion_style: "zoom",
    allergens: ["gluten", "sut", "yumurta"],
    paired_product_id: "prod-lemonade",
    pairing_note:
      "Satış verilerine göre burger siparişlerinin %88'inde yanında Ev Yapımı Naneli Limonata tercih ediliyor.",
    badge: "Çok Satan",
    calories: "740 kcal",
    is_signature: true,
    portion: "180g Köfte · Trüflü Patatesli",
    tasting_notes: ["Siyah Trüf Aioli", "Dry-Aged Dana", "Tereyağlı Brioche"],
    ingredients: ["Çift 90g Dry-Aged Dana", "İngiliz Cheddar", "Karamelize Soğan", "Brioche Ekmek"],
    popularity_score: 99,
    options: {
      label: "Pişirme Derecesi",
      choices: ["Orta", "Orta-İyi", "İyi Pişmiş"],
    },
    co_purchase_stats: [
      {
        product_id: "prod-lemonade",
        order_count: 514,
        match_rate: 88,
        reason: "Bu burgeri sipariş edenlerin %88'i yanında Ev Yapımı Naneli Limonata aldı.",
      },
      {
        product_id: "prod-sansebastian",
        order_count: 206,
        match_rate: 51,
        reason: "Yemek sonrası en çok tercih edilen tatlı: San Sebastian Cheesecake.",
      },
    ],
  },
  {
    id: "prod-avocado",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-main",
    name: "Poşe Yumurtalı Avokado Tost",
    description:
      "Ekşi mayalı artisan ekmek üzerinde ezilmiş avokado, iki adet organik poşe yumurta, mikro filizler ve chili yağı.",
    price: 295,
    prep_time: "10 dk",
    media_url: "/images/products/avocado-3d.jpg",
    motion_style: "pan",
    allergens: ["gluten", "yumurta"],
    paired_product_id: "prod-matcha",
    pairing_note:
      "Avokado Tost siparişlerinin %79'u Iced Ceremonial Matcha ile birlikte veriliyor.",
    calories: "490 kcal",
    is_signature: false,
    portion: "2 Dilim Ekşi Maya · 2 Poşe Yumurta",
    tasting_notes: ["Kremamsı Hass Avokado", "Ekşi Maya", "Hafif Chili Yağı"],
    ingredients: ["Ekşi Mayalı Ekmek", "Hass Avokado", "Organik Poşe Yumurta", "Mikro Filizler"],
    popularity_score: 89,
    co_purchase_stats: [
      {
        product_id: "prod-matcha",
        order_count: 318,
        match_rate: 79,
        reason: "Misafirlerin %79'u bu tabağı Iced Ceremonial Matcha ile birlikte tercih etti.",
      },
    ],
  },

  // Soğuk İçecekler
  {
    id: "prod-lemonade",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-cold",
    name: "Ev Yapımı Naneli Limonata",
    description:
      "Taze sıkılmış Bodrum limonu, bahçe nanesi, hafif zencefil infüzyonu ve kırık buz.",
    price: 135,
    prep_time: "3 dk",
    media_url: "/images/products/lemonade-3d.jpg",
    motion_style: "float",
    allergens: [],
    paired_product_id: "prod-burger",
    pairing_note:
      "Limonata siparişlerinin %81'i Lumina Trüf Smash Burger ile birlikte geliyor.",
    calories: "95 kcal",
    is_signature: false,
    portion: "350 ml · Kırık Buzlu",
    tasting_notes: ["Bodrum Limonu", "Taze Nane", "Hafif Zencefil"],
    ingredients: ["Taze Bodrum Limonu", "Bahçe Nanesi", "Taze Zencefil", "Az Şekerli Şurup"],
    popularity_score: 91,
    co_purchase_stats: [
      {
        product_id: "prod-burger",
        order_count: 489,
        match_rate: 81,
        reason: "Limonata sipariş edenlerin %81'i ana yemek olarak Lumina Trüf Smash Burger seçti.",
      },
    ],
  },
  {
    id: "prod-matcha",
    venue_id: DEMO_VENUE.id,
    category_id: "cat-cold",
    name: "Iced Ceremonial Matcha",
    description:
      "Japonya Uji bölgesi birinci sınıf ceremonial matcha, yulaf sütü ve hafif akçaağaç şurubu.",
    price: 185,
    prep_time: "4 dk",
    media_url: "/images/products/matcha-3d.jpg",
    motion_style: "zoom",
    allergens: ["soya"],
    paired_product_id: "prod-avocado",
    pairing_note:
      "Matcha siparişlerinin %77'si Poşe Yumurtalı Avokado Tost ile eşleşiyor.",
    badge: "İmza Soğuk",
    calories: "110 kcal",
    is_signature: true,
    portion: "320 ml · Yulaf Sütlü",
    tasting_notes: ["Uji Ceremonial Matcha", "Kremamsı Yulaf", "Akçaağaç"],
    ingredients: ["Japonya Uji Matcha", "Barista Yulaf Sütü", "Organik Akçaağaç Şurubu"],
    popularity_score: 94,
    options: {
      label: "Süt Seçimi",
      choices: ["Yulaf Sütü", "Badem Sütü", "Normal Süt"],
    },
    co_purchase_stats: [
      {
        product_id: "prod-avocado",
        order_count: 304,
        match_rate: 77,
        reason: "Matcha tercih edenlerin %77'si yanında Poşe Yumurtalı Avokado Tost sipariş etti.",
      },
    ],
  },
];

export const INITIAL_DEMO_ORDER: DemoOrder = {
  id: "order-masa-12",
  venue_id: DEMO_VENUE.id,
  table_number: 12,
  items: [
    { id: "oi-1", product_id: "prod-latte", name: "Lumina Signature Latte", price: 165, is_paid: false },
    { id: "oi-2", product_id: "prod-latte", name: "Lumina Signature Latte", price: 165, is_paid: false },
    { id: "oi-3", product_id: "prod-sansebastian", name: "San Sebastian Cheesecake", price: 240, is_paid: false },
    { id: "oi-4", product_id: "prod-burger", name: "Lumina Trüf Smash Burger", price: 390, is_paid: false },
    { id: "oi-5", product_id: "prod-lemonade", name: "Ev Yapımı Naneli Limonata", price: 135, is_paid: false },
  ],
  total_amount: 1095,
};

export function getVenueBySlug(slug: string): Venue {
  if (slug === DEMO_VENUE.slug) return DEMO_VENUE;
  return {
    ...DEMO_VENUE,
    slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1),
  };
}

export function getProductById(id?: string): Product | undefined {
  if (!id) return undefined;
  return DEMO_PRODUCTS.find((p) => p.id === id);
}

export function getSignatureProducts(): Product[] {
  return DEMO_PRODUCTS.filter((p) => p.is_signature).sort(
    (a, b) => (b.popularity_score ?? 0) - (a.popularity_score ?? 0)
  );
}
