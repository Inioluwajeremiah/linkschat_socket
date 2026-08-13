import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_DELAY_MS = 280;
const TAP_MOVE_THRESHOLD = 8; // px of movement before a touch counts as a drag, not a tap

type Props = {
  uri: string;
  /** Tap on the left half while not zoomed in — mirrors the old tapZones "go back". */
  onSingleTapLeft?: () => void;
  /** Tap on the right half while not zoomed in — mirrors the old tapZones "advance". */
  onSingleTapRight?: () => void;
  /** Fires true when the user starts zooming/panning, false once back at 1x — hook this up to pauseProgress/resumeProgress. */
  onZoomChange?: (zoomed: boolean) => void;
};

/**
 * Pinch-to-zoom + pan + double-tap-to-zoom image viewer, sized to the
 * image's real aspect ratio rather than stretched via absoluteFillObject.
 * Renders its own full-screen gesture-capture layer so it can still be
 * placed as a status "background" — the caller is expected to disable
 * (pointerEvents="none") any full-screen tap-zone overlay it would
 * otherwise conflict with while this component is showing an image.
 */
export default function ZoomableImage({
  uri,
  onSingleTapLeft,
  onSingleTapRight,
  onZoomChange,
}: Props) {
  // Falls back to a full-screen box until the real aspect ratio is known
  // from onLoad, then snaps to the correctly-contained size.
  const [displaySize, setDisplaySize] = useState({
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  });
  const [loaded, setLoaded] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // PanResponder math needs to read the *current* value synchronously on
  // every touch move, which Animated.Value doesn't expose publicly — so
  // these plain refs are kept in sync alongside the Animated ones.
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const pinchStartRef = useRef({ distance: 0, scale: 1 });
  const panStartRef = useRef({ translateX: 0, translateY: 0 });
  const lastTapAtRef = useRef(0);
  const gestureModeRef = useRef<"none" | "pinch" | "pan">("none");

  const clampTranslate = (x: number, y: number, atScale: number) => {
    // How far the zoomed image can pan before its edge would reveal
    // empty space — half the extra size scaling introduced, per axis.
    const maxX = (displaySize.width * (atScale - 1)) / 2;
    const maxY = (displaySize.height * (atScale - 1)) / 2;
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  };

  const distanceBetween = (touches: { pageX: number; pageY: number }[]) => {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  const animateTo = (nextScale: number, nextX: number, nextY: number) => {
    scaleRef.current = nextScale;
    translateRef.current = { x: nextX, y: nextY };
    Animated.parallel([
      Animated.spring(scale, {
        toValue: nextScale,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(translateX, {
        toValue: nextX,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(translateY, {
        toValue: nextY,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
    onZoomChange?.(nextScale > 1.01);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          gestureModeRef.current = "pinch";
          pinchStartRef.current = {
            distance: distanceBetween(touches),
            scale: scaleRef.current,
          };
        } else {
          gestureModeRef.current = "pan";
          panStartRef.current = {
            translateX: translateRef.current.x,
            translateY: translateRef.current.y,
          };
        }
      },

      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;

        if (touches.length === 2) {
          gestureModeRef.current = "pinch";
          const newDistance = distanceBetween(touches);
          const ratio = newDistance / (pinchStartRef.current.distance || 1);
          const nextScale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, pinchStartRef.current.scale * ratio)
          );
          scaleRef.current = nextScale;
          scale.setValue(nextScale);
          onZoomChange?.(nextScale > 1.01);
          return;
        }

        if (scaleRef.current <= 1) return; // nothing to pan when not zoomed in

        gestureModeRef.current = "pan";
        const clamped = clampTranslate(
          panStartRef.current.translateX + gestureState.dx,
          panStartRef.current.translateY + gestureState.dy,
          scaleRef.current
        );
        translateRef.current = clamped;
        translateX.setValue(clamped.x);
        translateY.setValue(clamped.y);
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (gestureModeRef.current === "pinch") {
          if (scaleRef.current <= 1.02) {
            animateTo(1, 0, 0);
          } else {
            const clamped = clampTranslate(
              translateRef.current.x,
              translateRef.current.y,
              scaleRef.current
            );
            animateTo(scaleRef.current, clamped.x, clamped.y);
          }
          gestureModeRef.current = "none";
          return;
        }

        const wasTap =
          Math.abs(gestureState.dx) < TAP_MOVE_THRESHOLD &&
          Math.abs(gestureState.dy) < TAP_MOVE_THRESHOLD;

        gestureModeRef.current = "none";

        if (!wasTap) return; // was a pan drag — leave it where it was released

        const now = Date.now();
        const isDoubleTap = now - lastTapAtRef.current < DOUBLE_TAP_DELAY_MS;
        lastTapAtRef.current = now;

        if (isDoubleTap) {
          animateTo(scaleRef.current > 1 ? 1 : DOUBLE_TAP_SCALE, 0, 0);
        } else if (scaleRef.current > 1) {
          // Single tap while zoomed — zoom back out rather than
          // navigating, since the person is inspecting the photo.
          animateTo(1, 0, 0);
        } else {
          // Single tap at 1x — same left/right split the old full-screen
          // tap zones used for advancing/going back between statuses.
          const tapX = evt.nativeEvent.pageX;
          if (tapX < SCREEN_WIDTH / 2) onSingleTapLeft?.();
          else onSingleTapRight?.();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          displaySize,
          {
            opacity: loaded ? 1 : 0,
            transform: [{ translateX }, { translateY }, { scale }],
          },
        ]}
      >
        <Image
          source={{ uri }}
          style={displaySize}
          contentFit="contain"
          onLoad={(e) => {
            const width = e?.source?.width;
            const height = e?.source?.height;
            if (!width || !height) {
              setLoaded(true);
              return;
            }
            const aspect = width / height;
            let w = SCREEN_WIDTH;
            let h = w / aspect;
            if (h > SCREEN_HEIGHT) {
              h = SCREEN_HEIGHT;
              w = h * aspect;
            }
            setDisplaySize({ width: w, height: h });
            setLoaded(true);
          }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});
