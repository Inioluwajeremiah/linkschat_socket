import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface Props {
  visible: boolean;
  type: "image" | "video" | null;
  uri: string | null;
  onClose: () => void;
}

export default function MediaViewerModal({
  visible,
  type,
  uri,
  onClose,
}: Props) {
  const translateY = useRef(new Animated.Value(0)).current;
  const [playing, setPlaying] = useState(true);
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [zoomed, setZoomed] = useState(false);

  const player = useVideoPlayer(type === "video" && uri ? uri : null, (p) => {
    p.loop = false;
  });

  // Swipe-down-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 20,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    translateY.setValue(0);
    setZoomed(false);
  }, [visible, uri]);

  useEffect(() => {
    if (!visible || type !== "video" || !player) return;

    const playSub = player.addListener("playingChange", ({ isPlaying }) =>
      setPlaying(isPlaying)
    );
    const timeSub = player.addListener("timeUpdate", (payload) => {
      setTime({ current: payload.currentTime, duration: player.duration || 0 });
    });

    player.play();
    return () => {
      playSub?.remove();
      timeSub?.remove();
      player.pause();
    };
  }, [visible, type, player]);

  if (!visible || !uri) return null;

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const progress = time.duration > 0 ? time.current / time.duration : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar hidden />
      <Animated.View
        style={[styles.backdrop, { transform: [{ translateY }] }]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={16}
        >
          <View style={styles.closeCircle}>
            <Ionicons name="close" size={24} color="#fff" />
          </View>
        </TouchableOpacity>

        {type === "image" && (
          <TouchableOpacity
            activeOpacity={1}
            style={styles.mediaWrap}
            onPress={() => setZoomed((z) => !z)}
          >
            <Image
              source={{ uri }}
              style={[
                styles.media,
                zoomed && { width: SCREEN_W * 1.8, height: SCREEN_H * 1.8 },
              ]}
              contentFit="contain"
            />
          </TouchableOpacity>
        )}

        {type === "video" && (
          <View style={styles.mediaWrap}>
            <VideoView
              style={styles.media}
              player={player}
              nativeControls={false}
              contentFit="contain"
            />
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => (playing ? player.pause() : player.play())}
            >
              {!playing && (
                <View style={styles.centerPlayWrap}>
                  <View style={styles.centerPlay}>
                    <Ionicons name="play" size={32} color="#fff" />
                  </View>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.videoControls}>
              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <Text style={styles.timeText}>
                {fmt(time.current)} / {fmt(time.duration)}
              </Text>
            </View>
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: { position: "absolute", top: 50, right: 16, zIndex: 10 },
  closeCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaWrap: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: "center",
    alignItems: "center",
  },
  media: { width: SCREEN_W, height: SCREEN_H * 0.8 },
  centerPlayWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  centerPlay: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoControls: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    gap: 8,
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#00d4aa" },
  timeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
