import { useState } from "react";
import { apiClient } from "../api/client";

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "ai";
  recommendations?: any[]; // For dish cards
}

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      text: "Buongiorno! I am **Mr. Capo**. How may I assist your culinary journey today?",
      sender: "ai",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await apiClient.post("/v1/ai/chat", { message: text });
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: res.data.text,
        sender: "ai",
        recommendations: res.data.recommendations,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Chat error:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "My apologies, something went wrong in the kitchen. Please try again.",
        sender: "ai",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
}
