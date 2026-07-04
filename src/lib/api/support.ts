// src/lib/api/support.ts
import { apiClient } from "./client";

export interface SupportTicket {
  id: number;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
}

export interface SupportMessage {
  id: number;
  text: string;
  senderId: number;
  isSupportAgent: boolean;
  createdAt: string;
}

export const supportApi = {
  createTicket: async (data: { subject: string; initialMessage: string }) => {
    const res = await apiClient.post<SupportTicket>("/support/tickets", data);
    return res.data;
  },

  getTickets: async () => {
    const res = await apiClient.get<SupportTicket[]>("/support/tickets");
    return res.data;
  },

  getTicket: async (ticketId: number) => {
    const res = await apiClient.get<SupportTicket>(
      `/support/tickets/${ticketId}`,
    );
    return res.data;
  },

  sendMessage: async (data: { ticketId: number; text: string }) => {
    const res = await apiClient.post<SupportMessage>("/support/messages", data);
    return res.data;
  },
};
