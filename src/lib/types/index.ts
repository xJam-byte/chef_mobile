/**
 * TypeScript interfaces for the Chef app
 */

export type UserRole = "customer" | "chef";
// ==================== Auth ====================

export interface LoginEmailDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email?: string;
  password: string;
  phone_number: string;
  role?: UserRole;
  referral_code?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==================== User ====================

export type UserTier = "bronze" | "silver" | "gold" | "platinum";

export type CoinTransactionType =
  | "cashback"
  | "referral_bonus"
  | "taster_reward"
  | "order_payment"
  | "order_refund"
  | "battle_prize"
  | "admin_adjust";

export interface CoinTransaction {
  tx_id: number;
  walletId: number;
  type: CoinTransactionType;
  amount: number;
  orderId?: number | null;
  referenceId?: string | null;
  description?: string | null;
  createdAt: string;
}

export interface WalletOverview {
  balance: number;
  tier: UserTier;
  cashback_rate: number;
  lifetime_spend: number;
  next_tier: {
    tier: UserTier;
    threshold: number;
    remaining: number;
  } | null;
}

export interface User {
  user_id: number;
  name: string;
  username?: string | null;
  email?: string;
  password?: string;
  phone_number: string;
  profile_pic?: string;
  role: UserRole | "admin";
  tier?: UserTier;
  lifetime_spend?: string | number;
  createdAt: string;
  updatedAt: string;
  chefs?: Chef[];
  _count?: {
    followers: number;
    following: number;
  };
}


export interface UpdateContactsDto {
  email: string;
  name?: string;
  phone_number?: string;
  username?: string;
}

export interface UpdateEmailDto {
  oldEmail: string;
  newEmail: string;
}

export interface UpdatePasswordDto {
  /** Текущий пароль обязателен — защита от захвата аккаунта по украденному токену */
  currentPassword: string;
  password: string;
}

export interface UploadAvatarDto {
  avatar: string; // base64
  userId: number;
}

// ==================== Chef ====================

export interface Chef {
  chef_id: number;
  userId: number;
  bio?: string;
  rating: number;
  commission_rate?: string | number;
  rank_tier?: "top3" | "top10" | null;
  is_certified?: boolean;
  createdAt: string;
  updatedAt: string;
  users?: User;
  /** @alias users — some components use `chef.user` instead of `chef.users` */
  user?: User;
}

export interface BecomeChefDto {
  userId: number;
  bio?: string;
}

export interface ChefsResponse {
  data: Chef[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Dish ====================

export interface Dish {
  dish_id: number;
  chefId: number;
  name: string;
  description?: string;
  picture?: string;
  type: string;
  ingredients: string;
  price: number;
  time?: number;
  is_spicy: boolean;
  availability_status: "available" | "not_available";
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    per: string;
    confidence: number;
  } | null;
  nutrition_status?: "pending" | "done" | "failed" | null;
  createdAt: string;
  updatedAt: string;
  chefs?: Chef;
}

export interface CreateDishDto {
  chefId: number;
  name: string;
  description: string;
  picture: string; // base64
  type: string;
  ingredients: string;
  price: number;
  time?: number; // in minutes
  is_spicy?: boolean;
  availability_status?: "available" | "not_available";
}

export interface DishesResponse {
  data: Dish[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== Order ====================

export interface Order {
  order_id: number;
  userId: number;
  total_price: number;
  order_date: string;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivering" | "delivered" | "cancelled";
  order_details?: OrderDetail[];
  estimated_minutes?: number;
  delivery_address_id?: number;
  payment_method?: string;
  payment_status?: string;
  payment_transaction_id?: string;
  /** Delivery address (included from backend) */
  addresses?: Address;
  /** Customer info (included from backend) */
  users?: {
    user_id: number;
    name: string;
    email?: string;
    phone_number?: string;
    profile_pic?: string;
  };
  /** @alias users */
  user?: {
    user_id: number;
    name: string;
    email?: string;
    phone_number?: string;
    profile_pic?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail {
  order_detail_id: number;
  orderId: number;
  dishId: number;
  quantity: number;
  preferences: string;
  price: number;
  dish?: Dish;
  /** Backend returns 'dishes' (plural) from Prisma relation */
  dishes?: Dish & {
    chefs?: Chef & {
      users?: { name: string; profile_pic?: string };
    };
  };
}

export interface CreateOrderItemDto {
  dishId: number;
  quantity: number;
  preferences: string;
  price: number;
  /** Повар-исполнитель (оффер); по умолчанию — автор блюда */
  chefId?: number;
}

/** Повар, готовящий блюдо (dish offer) — у каждого своя цена */
export interface DishChefOffer {
  chef_id: number;
  user_id: number | null;
  name: string | null;
  avatar: string | null;
  rating: number;
  is_certified: boolean;
  rank_tier: string | null;
  price: number;
  is_author: boolean;
  is_open: boolean;
}

export interface CreateOrderDto {
  userId: number;
  total_price: number;
  status?: "pending";
  delivery_address_id?: number;
  payment_method?: string;
  payment_intent_id?: string;
  coins_to_spend?: number;
  items: CreateOrderItemDto[];
}

// ==================== Review ====================

export interface Review {
  review_id: number;
  userId: number;
  chefId?: number;
  dishId?: number;
  rating: number;
  comment?: string;
  review_date: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateReviewDto {
  userId: number;
  chefId?: number;
  dishId?: number;
  rating: number;
  comment?: string;
  photoUrl?: string;
}

// ==================== Address ====================

export interface Address {
  address_id: number;
  userId: number;
  street: string;
  city: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Cart (Local) ====================

export interface CartItem {
  dish: Dish;
  quantity: number;
  preferences: string;
  /** Выбранный повар-исполнитель (оффер); undefined = автор блюда */
  chefId?: number;
  chefName?: string;
  /** Цена выбранного повара; undefined = цена блюда */
  offerPrice?: number;
}

// ==================== Pagination ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ==================== Follows ====================

export interface Follow {
  id: number;
  followerId: number;
  followingId: number;
  createdAt: string;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
}

export interface FollowsResponse {
  success: boolean;
  data: User[];
  count: number;
}

export interface FollowStatsResponse {
  success: boolean;
  data: FollowStats;
}

export interface IsFollowingResponse {
  success: boolean;
  data: {
    isFollowing: boolean;
  };
}

// ==================== Chef Stats ====================

export interface ChefStats {
  totalOrders: number;
  totalRevenue: number;
  totalEarnings: number;
  averageOrderValue: number;
  monthlyEarnings: number;
  videoOrdersCount: number;
  topDishesThisWeek: Array<{
    dish_id: number;
    name: string;
    picture: string | null;
    ordersThisWeek: number;
    revenueThisWeek: number;
  }>;
}
