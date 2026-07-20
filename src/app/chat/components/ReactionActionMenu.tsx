import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Message } from "../../../types";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const QUICK_REACTIONS = ["❤️", "😂", "😮", "😢", "👏", "🔥"];

interface Action {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  message: Message | null;
  anchor: { x: number; y: number; width: number; height: number } | null;
  isOwn: boolean;
  isStarred: boolean;
  onClose: () => void;
  onReact: (emoji: string) => void;
  onReply: () => void;
  onEdit: () => void;
  onCopy: () => void;
  onStar: () => void;
  onForward: () => void;
  onDelete: (forEveryone: boolean) => void;
  colors: any;
}

export default function ReactionActionMenu({
  visible,
  message,
  anchor,
  isOwn,
  isStarred,
  onClose,
  onReact,
  onReply,
  onEdit,
  onCopy,
  onStar,
  onForward,
  onDelete,
  colors,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 280,
          friction: 18,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!visible || !message || !anchor) return null;

  // Position the menu above or below the message depending on screen position
  const menuHeight = 280;
  const showAbove = anchor.y + anchor.height + menuHeight > SCREEN_H - 100;
  const menuTop = showAbove
    ? anchor.y - menuHeight - 8
    : anchor.y + anchor.height + 8;
  const menuLeft = Math.max(
    12,
    Math.min(SCREEN_W - 252, isOwn ? anchor.x + anchor.width - 240 : anchor.x)
  );

  const ONE_HOUR = 60 * 60 * 1000;
  const messageAge = Date.now() - new Date(message.createdAt).getTime();
  const canModifyForEveryone =
    isOwn && !message.isDeleted && messageAge <= ONE_HOUR;

  const isDeleted = message.isDeleted;
  const isText = message.type === "text";

  const actions: Action[] = [
    {
      icon: "return-up-back-outline",
      label: "Reply",
      onPress: () => {
        onClose();
        onReply();
      },
    },
    // ...(!isDeleted && isOwn && isText
    ...(!isDeleted && canModifyForEveryone && isText
      ? [
          {
            icon: "create-outline",
            label: "Edit",
            onPress: () => {
              onClose();
              onEdit();
            },
          },
        ]
      : []),
    {
      icon: "copy-outline",
      label: "Copy",
      color: colors.textPrimary,
      onPress: () => {
        onClose();
        onCopy();
      },
    },
    {
      icon: isStarred ? "star" : "star-outline",
      label: isStarred ? "Unstar" : "Star",
      color: "#ffc107",
      onPress: () => {
        onClose();
        onStar();
      },
    },
    {
      icon: "share-outline",
      label: "Forward",
      onPress: () => {
        onClose();
        onForward();
      },
    },
    {
      icon: "trash-outline",
      label: "Delete for me",
      color: "#ff4757",
      onPress: () => {
        onClose();
        onDelete(false);
      },
    },
    // ...(isOwn && !isDeleted
    ...(canModifyForEveryone
      ? [
          {
            icon: "trash-bin-outline",
            label: "Delete for everyone",
            color: "#ff4757",
            onPress: () => {
              onClose();
              onDelete(true);
            },
          },
        ]
      : []),
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />

      <Animated.View
        style={[
          styles.container,
          {
            top: menuTop,
            left: menuLeft,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {/* Quick reactions */}
        {!isDeleted && (
          <View style={styles.reactionsRow}>
            {QUICK_REACTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionBtn}
                onPress={() => {
                  onClose();
                  onReact(emoji);
                }}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Actions */}
        {actions.map(({ icon, label, color, onPress }, i) => (
          <TouchableOpacity
            key={label}
            style={[
              styles.actionRow,
              i < actions.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Ionicons
              name={icon as any}
              size={18}
              color={color || colors.textPrimary}
            />
            <Text
              style={[
                styles.actionLabel,
                { color: color || colors.textPrimary },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 240,
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  reactionsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "space-around",
  },
  reactionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  reactionEmoji: { fontSize: 22 },
  divider: { height: StyleSheet.hairlineWidth },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  actionLabel: { fontSize: 14, fontWeight: "600" },
});
