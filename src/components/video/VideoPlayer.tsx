/**
 * Video Player Component
 * Migrated to expo-video (new API)
 */

import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface VideoPlayerProps {
  uri: string;
  isActive: boolean;
  onPlaybackStatusUpdate?: (isPlaying: boolean) => void;
}

export default function VideoPlayer({ uri, isActive, onPlaybackStatusUpdate }: VideoPlayerProps) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!player) return;

    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player]);

  useEffect(() => {
    if (!player) return;

    player.muted = isMuted;
  }, [isMuted, player]);

  useEffect(() => {
    if (!player) return;

    const subscription = player.addListener("playingChange", (newIsPlaying) => {
      setIsPlaying(newIsPlaying);
      onPlaybackStatusUpdate?.(newIsPlaying);
    });

    return () => {
      subscription.remove();
    };
  }, [player, onPlaybackStatusUpdate]);

  const togglePlayPause = () => {
    if (!player) return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={togglePlayPause}
    >
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Mute Button */}
      <TouchableOpacity
        style={styles.muteButton}
        onPress={toggleMute}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isMuted ? "volume-mute" : "volume-high"}
          size={24}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Play/Pause Indicator */}
      {!isPlaying && (
        <View style={styles.playIcon}>
          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.7)" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: SCREEN_HEIGHT,
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  muteButton: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{translateX: -32}, {translateY: -32}],
  },
});
