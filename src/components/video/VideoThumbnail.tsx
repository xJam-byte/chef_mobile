import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";

interface VideoThumbnailProps {
  uri: string;
  style?: ViewStyle | ViewStyle[];
  positionMillis?: number;
}

export default function VideoThumbnail({
  uri,
  style,
  positionMillis = 1000,
}: VideoThumbnailProps) {
  const player = useVideoPlayer(uri, (player) => {
    player.muted = true;
    player.loop = false;
    player.pause();
    player.currentTime = positionMillis / 1000;
  });

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="cover"
      nativeControls={false}
    />
  );
}
