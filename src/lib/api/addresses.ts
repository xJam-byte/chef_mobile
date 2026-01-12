// src/lib/api/addresses.ts
import { apiClient } from "./client";

export interface Address {
  address_id: number;
  user_id: number;
  street: string;
  city: string;
  postal_code: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAddressDto {
  userId: number;
  street: string;
  city: string;
  postalCode: string;
}

export const getMyAddresses = async (userId: number): Promise<Address[]> => {
  const res = await apiClient.get<Address[]>(`/address/ofOne?userId=${userId}`);
  return res.data;
};

export const createAddress = async (data: CreateAddressDto): Promise<Address> => {
  const res = await apiClient.post<Address>("/address/addOne", data);
  return res.data;
};
