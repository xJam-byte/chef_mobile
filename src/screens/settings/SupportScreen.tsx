import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { PremiumHeader, Button, Spinner } from "../../components/ui";
import {
  useSupportTickets,
  useCreateTicket,
  useTicketDetails,
  useSendMessage,
} from "../../lib/hooks";
import { useAuthStatus } from "../../lib/hooks/useAuth";

export default function SupportScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { data: user } = useAuthStatus();

  const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newTicketSubject, setNewTicketSubject] = useState("");

  const { data: tickets, isLoading: ticketsLoading } = useSupportTickets();
  const createTicketMutation = useCreateTicket();

  // Only fetch details if we have an active ticket
  const { data: activeTicket, isLoading: messagesLoading } = useTicketDetails(
    activeTicketId || 0,
  );
  const sendMessageMutation = useSendMessage();

  useEffect(() => {
    if (tickets && tickets.length > 0 && !activeTicketId) {
      // Auto-select the most recent ticket if exists
      setActiveTicketId(tickets[0].id);
    }
  }, [tickets]);

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim()) return;
    createTicketMutation.mutate(
      {
        subject: newTicketSubject,
        initialMessage: newMessage || "Help needed",
      },
      {
        onSuccess: (data) => {
          setActiveTicketId(data.id);
          setNewTicketSubject("");
          setNewMessage("");
        },
      },
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeTicketId) return;
    sendMessageMutation.mutate(
      {
        ticketId: activeTicketId,
        text: newMessage,
      },
      {
        onSuccess: () => {
          setNewMessage("");
        },
      },
    );
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === user?.user_id;
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
          { backgroundColor: isMe ? c.primary : c.card },
        ]}
      >
        <Text style={{ color: isMe ? "#fff" : c.text }}>{item.text}</Text>
      </View>
    );
  };

  if (ticketsLoading)
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <Spinner />
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <PremiumHeader title={t("settings.support", "Support")} backButton />

      {/* If no tickets, show create form */}
      {(!tickets || tickets.length === 0) && !activeTicketId ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: c.text }]}>
            {t("support.noTickets", "How can we help?")}
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: c.card, color: c.text, borderColor: c.border },
            ]}
            placeholder={t("support.subjectPlaceholder", "Subject")}
            placeholderTextColor={c.textMuted}
            value={newTicketSubject}
            onChangeText={setNewTicketSubject}
          />
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: c.card,
                color: c.text,
                borderColor: c.border,
                minHeight: 100,
              },
            ]}
            placeholder={t(
              "support.messagePlaceholder",
              "Describe your issue...",
            )}
            placeholderTextColor={c.textMuted}
            multiline
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <Button
            title={t("support.startChat", "Start Chat")}
            onPress={handleCreateTicket}
            loading={createTicketMutation.isPending}
            disabled={!newTicketSubject.trim()}
          />
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <FlatList
            data={activeTicket?.messages || []}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 16 }}
            inverted={false} // Messages come properly ordered? API sends ASC. So simple list is fine.
          />

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: c.card, borderTopColor: c.border },
            ]}
          >
            <TextInput
              style={[
                styles.chatInput,
                { backgroundColor: c.background, color: c.text },
              ]}
              placeholder={t("common.typeMessage", "Type a message...")}
              placeholderTextColor={c.textMuted}
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              style={[styles.sendBtn, { backgroundColor: c.primary }]}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    padding: 20,
    justifyContent: "center",
    flex: 1,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "80%",
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    padding: 12,
    borderRadius: 24,
    marginRight: 12,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
