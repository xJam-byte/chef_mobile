import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAiChat, ChatMessage } from "../../lib/hooks/useAiChat";
import { useColors } from "../../lib/theme";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function AiChatModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const c = useColors();
  const { messages, isLoading, sendMessage } = useAiChat();
  const [input, setInput] = React.useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 500);
    }
  }, [visible, messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isAi = item.sender === "ai";
    
    // Simple bold parser: **text** -> bold
    const parts = item.text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <View style={[
        styles.messageRow,
        isAi ? styles.aiRow : styles.userRow
      ]}>
        {isAi && (
           <View style={styles.aiAvatar}>
             <Image 
               source={require("../../images/Capo.png")} 
               style={{ width: 32, height: 32, borderRadius: 16 }} 
               resizeMode="cover"
             />
           </View>
        )}
        <View style={[
          styles.bubble,
          isAi ? styles.aiBubble : styles.userBubble
        ]}>
            <Text style={[styles.messageText, isAi ? styles.aiText : styles.userText]}>
                {parts.map((part, index) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return <Text key={index} style={{fontWeight: 'bold'}}>{part.slice(2, -2)}</Text>;
                    }
                    return part;
                })}
            </Text>
            {item.recommendations && item.recommendations.length > 0 && (
                <View style={styles.recommendationContainer}>
                    <Text style={styles.recommendationTitle}>Recommends:</Text>
                    {item.recommendations.map((dish: any, idx) => (
                        <View key={idx} style={styles.recommendationCard}>
                            <Text style={styles.dishName}>{dish.name}</Text>
                            <Text style={styles.dishPrice}>{Number(dish.price)} ₸</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: c.card }]}>
          <Text style={[styles.headerTitle, { color: c.text }]}>Mr. Capo</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={c.text} />
          </TouchableOpacity>
        </View>

        {/* Chat Area */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.listContent, { paddingBottom: 20 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Area */}
        <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
        >
          <View style={[styles.inputContainer, { backgroundColor: c.card, paddingBottom: insets.bottom + 10 }]}>
            <TextInput
                style={[styles.input, { backgroundColor: c.background, color: c.text }]}
                placeholder="Ask Mr. Capo..."
                placeholderTextColor={c.textSecondary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handleSend}
                returnKeyType="send"
            />
            <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: input.trim() ? "#FFD700" : c.border }]}
                onPress={handleSend}
                disabled={!input.trim()}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                ) : (
                    <Ionicons name="arrow-up" size={20} color={input.trim() ? "#000" : c.textSecondary} />
                )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    right: 16,
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
    maxWidth: "85%",
  },
  aiRow: {
    alignSelf: "flex-start",
  },
  userRow: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  bubble: {
    padding: 12,
    borderRadius: 16,
  },
  aiBubble: {
    backgroundColor: "#2A2A2A",
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: "#FFD700",
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: "#fff",
  },
  userText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  recommendationContainer: {
    marginTop: 8,
    gap: 6,
  },
  recommendationTitle: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  recommendationCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 8,
    borderRadius: 8,
  },
  dishName: {
    color: "#fff",
    fontWeight: "bold",
  },
  dishPrice: {
    color: "#FFD700",
    fontSize: 12,
  }
});
