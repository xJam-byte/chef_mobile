import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "../api/support";
import { showMessage } from "react-native-flash-message";

export const useSupportTickets = () => {
  return useQuery({
    queryKey: ["support_tickets"],
    queryFn: supportApi.getTickets,
  });
};

export const useTicketDetails = (ticketId: number) => {
  return useQuery({
    queryKey: ["support_ticket", ticketId],
    queryFn: () => supportApi.getTicket(ticketId),
    enabled: !!ticketId,
    refetchInterval: 5000, // Poll for new messages every 5s
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support_tickets"] });
      showMessage({
        message: "Ticket created",
        description: "Support team will reply shortly.",
        type: "success",
      });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: supportApi.sendMessage,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["support_ticket", variables.ticketId],
      });
    },
  });
};
