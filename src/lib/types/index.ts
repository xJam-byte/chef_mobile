/**
 * TypeScript interfaces for the Chef app
 */

export type UserRole = "customer" | "chef";
// ==================== Auth ====================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  role?: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ==================== User ====================

export interface User {
  user_id: number;
  name: string;
  email: string;
  password?: string;
  phone_number?: string;
  profile_pic?: string;
  role: UserRole | "admin";
  createdAt: string;
  updatedAt: string;
  chefs?: Chef[]; // Chef profile if user is a chef
}

export interface UpdateContactsDto {
  email: string;
  name?: string;
  phone_number?: string;
}

export interface UpdateEmailDto {
  oldEmail: string;
  newEmail: string;
}

export interface UpdatePasswordDto {
  email: string;
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
  createdAt: string;
  updatedAt: string;
  users?: User;
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
  availability_status: "available" | "not_available";
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishDto {
  chefId: number;
  name: string;
  description: string;
  picture: string; // base64
  type: string;
  ingredients: string;
  price: number;
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
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  orderDetails?: OrderDetail[];
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
}

export interface CreateOrderItemDto {
  dishId: number;
  quantity: number;
  preferences: string;
  price: number;
}

export interface CreateOrderDto {
  userId: number;
  total_price: number;
  status?: "pending";
  items: CreateOrderItemDto[];
}

// ==================== Review ====================

export interface Review {
  review_id: number;
  userId: number;
  chefId: number;
  rating: number;
  comment?: string;
  review_date: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateReviewDto {
  userId: number;
  chefId: number;
  rating: number;
  comment?: string;
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
}

// ==================== Pagination ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}
