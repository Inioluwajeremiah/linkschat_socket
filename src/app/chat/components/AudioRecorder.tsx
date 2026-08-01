import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";

// ---------------------------------------------------------------------------
// WHY THIS CHANGED
// ---------------------------------------------------------------------------
// recorder.pause() suspends the encoder but does NOT finalize the file's
// container (no moov atom / duration written). Loading that half-written
// file into the player during a pause leaves it stuck at isLoaded:false,
// duration:NaN — nothing audibly plays, even though play() "succeeds".
//
// The only way to get a genuinely playable file is to call recorder.stop().
// But stop() also ends the ability to append to that file, so "pause, then
// resume the SAME clip" isn't something expo-audio supports reliably.
//
// Fix: record in SEGMENTS. Every pause finalizes (stops) the current
// segment into its own playable file. Resume starts a brand new segment.
// Preview plays finished segments back-to-back. On send, all segments are
// handed to the caller as a playlist instead of a single uri.
//
// ⚠️ INTERFACE CHANGE: onSend now receives an array of clips instead of a
// single (uri, duration) pair, since expo-audio can't merge separate m4a
// files into one on-device without an extra native module (e.g.
// ffmpeg-kit-react-native). If you need a single merged file for upload,
// that merge step has to happen either with ffmpeg-kit or server-side after
// you upload each segment. Happy to wire that up next if you want it.
// ---------------------------------------------------------------------------

export interface RecordedSegment {
  uri: string;
  durationMs: number;
}

interface Props {
  visible: boolean;
  onSend: (segments: RecordedSegment[], totalDurationSeconds: number) => void;
  onCancel: () => void;
  colors: any;
}

type RecState = "recording" | "paused" | "idle";

const BAR_COUNT = 40;
const VISIBLE_BARS = 24;

const RECORDER_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  isMeteringEnabled: true,
};

const meteringToHeight = (db: number | undefined) => {
  const clamped = Math.max(-60, Math.min(0, db ?? -60));
  const ratio = (clamped + 60) / 60; // 0..1
  return 4 + ratio * 24;
};

export default function AudioRecorder({
  visible,
  onSend,
  onCancel,
  colors,
}: Props) {
  const recorder = useAudioRecorder(RECORDER_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 100);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const [state, setState] = useState<RecState>("idle");
  const [segments, setSegments] = useState<RecordedSegment[]>([]);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: BAR_COUNT }, () => 4)
  );

  // Which segment index we're previewing, and whether preview is active at all.
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Segments are captured in a ref too so async callbacks (like the
  // "advance to next segment" playback listener) always see the latest list
  // without needing to be re-subscribed every time segments changes.
  const segmentsRef = useRef<RecordedSegment[]>([]);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  useEffect(() => {
    if (visible) beginRecording();
    else teardown();
    return () => {
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Mic pulse only while actively recording
  useEffect(() => {
    if (state === "recording") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [state]);

  // Waveform driven by live metering while recording.
  useEffect(() => {
    if (state === "recording" && recorderState.isRecording) {
      setBarHeights((prev) => [
        ...prev.slice(1),
        meteringToHeight(recorderState.metering),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState.metering]);

  // Auto-advance preview to the next finished segment when the current one
  // finishes playing, so pause -> resume -> pause -> preview plays the
  // whole thing back seamlessly instead of just the last chunk.
  useEffect(() => {
    if (!isPreviewing) return;
    if (!playerStatus.didJustFinish) return;

    const next = previewIndex + 1;
    const list = segmentsRef.current;
    if (next < list.length) {
      setPreviewIndex(next);
      player.replace(list[next].uri);
      player.play();
    } else {
      setIsPreviewing(false);
      setPreviewIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerStatus.didJustFinish]);

  // ---------- Recording lifecycle ----------
  const beginRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        // console.warn("Recording permission denied");
        onCancel();
        return;
      }
      setSegments([]);
      setBarHeights(Array.from({ length: BAR_COUNT }, () => 4));
      await startNewSegment();
      setState("recording");
    } catch (e) {
      // console.warn("Recording start failed", e);
    }
  };

  // Starts a brand new recording file. Used both for the very first segment
  // and for every "resume" after a pause.
  const startNewSegment = async () => {
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  // Finalizes the in-progress segment (if any) into a real, playable file
  // and appends it to the segments list. Returns the segment, or null if
  // nothing was recording.
  const finalizeCurrentSegment = async (): Promise<RecordedSegment | null> => {
    if (!recorderState.isRecording) return null;
    const durationMs = recorderState.durationMillis;
    try {
      await recorder.stop();
    } catch (e) {
      // console.warn("Stop failed", e);
    }
    const uri = recorder.uri;
    if (!uri) return null;
    const segment = { uri, durationMs };
    setSegments((prev) => [...prev, segment]);
    return segment;
  };

  const pauseRecording = async () => {
    if (state !== "recording") return;
    try {
      await finalizeCurrentSegment();
      setState("paused");
    } catch (e) {
      // console.warn("Pause failed", e);
    }
  };

  const resumeRecording = async () => {
    if (state !== "paused") return;
    try {
      if (isPreviewing) {
        player.pause();
        setIsPreviewing(false);
        setPreviewIndex(0);
      }
      await startNewSegment();
      setState("recording");
    } catch (e) {
      // console.warn("Resume failed", e);
    }
  };

  const teardown = async () => {
    try {
      if (playerStatus.playing) player.pause();
      if (recorderState.isRecording) await recorder.stop();
    } catch {}
    setState("idle");
    setSegments([]);
    setIsPreviewing(false);
    setPreviewIndex(0);
  };

  // ---------- Preview playback (only available while paused) ----------
  // Plays finished segments back-to-back starting from the first one.
  const togglePreview = async () => {
    if (state !== "paused") return;

    if (isPreviewing) {
      player.pause();
      setIsPreviewing(false);
      return;
    }

    if (segments.length === 0) return;

    try {
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
      setPreviewIndex(0);
      player.replace(segments[0].uri);
      player.play();
      setIsPreviewing(true);
    } catch (e) {
      // console.warn("Preview failed", e);
    }
  };

  // ---------- Actions ----------
  const handleDelete = async () => {
    await teardown();
    onCancel();
  };

  const handleSend = async () => {
    if (playerStatus.playing) player.pause();

    // If we're still recording, finalize that last segment first.
    const lastSegment =
      state === "recording" ? await finalizeCurrentSegment() : null;

    const finalSegments = lastSegment ? [...segments, lastSegment] : segments;

    setState("idle");

    if (finalSegments.length === 0) {
      onCancel();
      return;
    }

    const totalSeconds = Math.round(
      finalSegments.reduce((sum, s) => sum + s.durationMs, 0) / 1000
    );
    onSend(finalSegments, totalSeconds);
  };

  const fmt = (s: number) =>
    `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

  if (!visible || state === "idle") return null;

  const segmentsTotalMs = segments.reduce((sum, s) => sum + s.durationMs, 0);
  const totalMs =
    state === "recording"
      ? segmentsTotalMs + recorderState.durationMillis
      : segmentsTotalMs;
  const totalSeconds = totalMs / 1000;
  const visibleBars = barHeights.slice(-VISIBLE_BARS);

  // Preview progress across the whole playlist, not just the current segment.
  const playedMsBeforeCurrent = segments
    .slice(0, previewIndex)
    .reduce((sum, s) => sum + s.durationMs, 0);
  const previewCurrentMs =
    playedMsBeforeCurrent + playerStatus.currentTime * 1000;
  const previewTotalMs = segmentsTotalMs || 1;
  const playedFraction = isPreviewing ? previewCurrentMs / previewTotalMs : 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderTopColor: colors.border },
      ]}
    >
      {/* Delete */}
      <TouchableOpacity style={styles.iconBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={22} color="#ff4757" />
      </TouchableOpacity>

      {/* Timer + waveform (+ preview toggle when paused) */}
      <View style={[styles.pill, { backgroundColor: colors.background }]}>
        {state === "recording" && <View style={styles.recDot} />}
        {state === "paused" && segments.length > 0 && (
          <TouchableOpacity onPress={togglePreview} style={styles.previewBtn}>
            <Ionicons
              name={isPreviewing ? "pause" : "play"}
              size={16}
              color="#00d4aa"
            />
          </TouchableOpacity>
        )}

        <Text style={[styles.timer, { color: colors.textPrimary }]}>
          {isPreviewing
            ? `${fmt(previewCurrentMs / 1000)} / ${fmt(totalSeconds)}`
            : fmt(totalSeconds)}
        </Text>

        <View style={styles.waveform}>
          {visibleBars.map((h, i) => {
            const played = isPreviewing && i / VISIBLE_BARS < playedFraction;
            return (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor:
                      state === "recording"
                        ? "#00d4aa"
                        : played
                        ? "#00d4aa"
                        : colors.textMuted,
                  },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Pause / Resume */}
      <TouchableOpacity
        style={styles.iconBtn}
        onPress={state === "recording" ? pauseRecording : resumeRecording}
      >
        <View
          style={[styles.circleBtn, { backgroundColor: colors.background }]}
        >
          <Ionicons
            name={state === "recording" ? "pause" : "mic"}
            size={18}
            color={colors.textPrimary}
          />
        </View>
      </TouchableOpacity>

      {/* Send — works whether currently recording or paused */}
      <Animated.View
        style={{
          transform: [{ scale: state === "recording" ? pulseAnim : 1 }],
        }}
      >
        <TouchableOpacity onPress={handleSend}>
          <LinearGradient
            colors={["#00d4aa", "#00b090"]}
            style={styles.sendGradient}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  iconBtn: { justifyContent: "center", alignItems: "center" },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBtn: { width: 22, alignItems: "center" },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff4757" },
  timer: { fontSize: 14, fontWeight: "700", minWidth: 40 },
  waveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    height: 24,
    overflow: "hidden",
  },
  waveBar: { width: 3, borderRadius: 2, minHeight: 4 },
  sendGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
});
