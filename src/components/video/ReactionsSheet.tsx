/**
 * Видеореакции на видео: список + запись (доступна от Silver).
 */

import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { showMessage } from "react-native-flash-message";
import { useColors } from "../../lib/theme";
import { Avatar, Spinner } from "../ui";
import VideoPlayer from "./VideoPlayer";
import {
  useVideoReactions,
  useCreateReaction,
  useDeleteReaction,
} from "../../lib/hooks/useVideos";
import { useProfile } from "../../lib/hooks";
import { useWallet } from "../../lib/hooks/useWallet";

const { width } = Dimensions.get("window");

interface ReactionsSheetProps {
  videoId: string | null;
  onClose: () => void;
}

export default function ReactionsSheet({ videoId, onClose }: ReactionsSheetProps) {
  const { t } = useTranslation();
  const c = useColors();
  const { data: profile } = useProfile();
  const { data: wallet } = useWallet();
  const { data, isLoading } = useVideoReactions(videoId ?? undefined);
  const createMutation = useCreateReaction();
  const deleteMutation = useDeleteReaction();
  const [playingId, setPlayingId] = useState<string | null>(null);

  const tier = wallet?.tier ?? profile?.tier ?? "bronze";
  const canReact = tier !== "bronze";

  const handleRecord = async () => {
    if (!videoId) return;
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 30,
      quality: 0.7 as any,
    });
    if (result.canceled || !result.assets[0]) return;
    try {
      await createMutation.mutateAsync({
        videoId,
        videoUri: result.assets[0].uri,
        durationSec: Math.min(
          30,
          Math.round((result.assets[0].duration ?? 0) / 1000) || 30
        ),
      });
      showMessage({ message: t("reactions.published"), type: "success" });
    } catch (e: any) {
      showMessage({
        message: e?.response?.data?.message ?? t("reactions.failed"),
        type: "danger",
      });
    }
  };

  return (
    <Modal
      visible={!!videoId}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: c.background }]}>
          <View style={[styles.header, { borderBottomColor: c.border }]}>
            <Text style={[styles.title, { color: c.text }]}>
              {t("reactions.title")}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={c.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Spinner />
          ) : (
            <FlatList
              horizontal
              data={data?.items ?? []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: c.textMuted }]}>
                  {t("reactions.empty")}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.reactionCard}>
                  <TouchableOpacity
                    style={[styles.videoBox, { backgroundColor: c.card }]}
                    onPress={() =>
                      setPlayingId(playingId === item.id ? null : item.id)
                    }
                  >
                    {playingId === item.id ? (
                      <VideoPlayer uri={item.url} isActive />
                    ) : (
                      <View style={styles.playOverlay}>
                        <Ionicons name="play-circle" size={44} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.reactionMeta}>
                    <Avatar
                      uri={item.author?.profile_pic ?? undefined}
                      name={item.author?.name}
                      size="sm"
                    />
                    <Text
                      style={[styles.authorName, { color: c.text }]}
                      numberOfLines={1}
                    >
                      {item.author?.name}
                    </Text>
                    {item.authorId === profile?.user_id && (
                      <TouchableOpacity
                        onPress={() =>
                          deleteMutation.mutate({
                            reactionId: item.id,
                            videoId: videoId!,
                          })
                        }
                      >
                        <Ionicons name="trash-outline" size={16} color={c.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            />
          )}

          {canReact ? (
            <TouchableOpacity
              style={[styles.recordBtn, { backgroundColor: c.primary }]}
              onPress={handleRecord}
              disabled={createMutation.isPending}
            >
              <Ionicons name="videocam" size={20} color="#fff" />
              <Text style={styles.recordText}>
                {createMutation.isPending
                  ? t("reactions.uploading")
                  : t("reactions.record")}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.lockedBox, { backgroundColor: c.pillBg }]}>
              <Ionicons name="lock-closed" size={18} color={c.textMuted} />
              <Text style={[styles.lockedText, { color: c.textSecondary }]}>
                {t("reactions.locked")}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "flex-end" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  list: { padding: 16, gap: 12, minHeight: 210 },
  empty: { alignSelf: "center", marginTop: 60, fontSize: 14 },
  reactionCard: { width: width * 0.32, marginRight: 12 },
  videoBox: {
    width: "100%",
    aspectRatio: 9 / 16,
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  playOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  reactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  authorName: { flex: 1, fontSize: 12, fontWeight: "600" },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  recordText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  lockedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  lockedText: { fontSize: 13, fontWeight: "600" },
});
