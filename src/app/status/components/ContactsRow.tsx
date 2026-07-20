import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAppDispatch } from "@/hooks/useRedux";
import { User } from "@/types";
import { chatApi, userApi } from "@/services/api";
import { ScrollView } from "react-native";
import { BorderRadius, Spacing } from "@/constants";

export default function ContactsRow({ colors }: { colors: any }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [contacts, setContacts] = useState<User[]>([]);
  const [menuContact, setMenuContact] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    userApi
      .getContacts()
      .then((res) => {
        if (res.success) {
          const withPhone = (res.data.contacts as User[]).filter(
            (c) => c.phone
          );
          setContacts(withPhone.slice(0, 12));
        }
      })
      .catch(() => {});
  }, []);

  const openMenu = (contact: User) => {
    setMenuContact(contact);
    setShowMenu(true);
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 200,
        friction: 22,
      }),
    ]).start();
  };

  const closeMenu = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMenu(false);
      setMenuContact(null);
      callback?.();
    });
  };

  const handleAction = (action: () => void) => {
    closeMenu(action);
  };

  if (contacts.length === 0) return null;

  const menuInitials = menuContact?.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <View style={styles.contactsSection}>
        <View style={styles.contactsHeader}>
          <Text style={[styles.contactsLabel, { color: colors.textMuted }]}>
            PEOPLE
          </Text>
          <TouchableOpacity onPress={() => router.push("/phone-contacts")}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contactsScroll}
        >
          {contacts.map((contact) => {
            const initials = contact.name
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            const startChat = async () => {
              try {
                const res = await chatApi.createPrivateChat(contact._id);
                if (res.success) router.push(`/chat/${res.data.chat._id}`);
              } catch {}
            };

            return (
              <View key={contact._id} style={styles.contactChipWrap}>
                <TouchableOpacity
                  style={styles.contactChip}
                  onPress={startChat}
                  activeOpacity={0.8}
                >
                  <View style={styles.contactAvatarWrap}>
                    {contact.avatar ? (
                      <Image
                        source={{ uri: contact.avatar }}
                        style={styles.contactAvatar}
                        contentFit="cover"
                      />
                    ) : (
                      <LinearGradient
                        colors={["#00d4aa", "#5b8dee"]}
                        style={styles.contactAvatarFallback}
                      >
                        <Text style={styles.contactInitials}>{initials}</Text>
                      </LinearGradient>
                    )}
                    {contact.isOnline && (
                      <View
                        style={[
                          styles.contactOnlineDot,
                          { borderColor: colors.background },
                        ]}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.contactName,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {contact.name.split(" ")[0]}
                  </Text>
                </TouchableOpacity>

                {/* Ellipsis button */}
                <TouchableOpacity
                  style={[
                    styles.contactMenuBtn,
                    { backgroundColor: colors.surface2 },
                  ]}
                  onPress={() => openMenu(contact)}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={12}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Options menu modal */}
      {showMenu && menuContact && (
        <Modal
          visible={showMenu}
          transparent
          animationType="none"
          onRequestClose={() => closeMenu()}
        >
          {/* Overlay */}
          <Animated.View style={[styles.menuOverlay, { opacity: overlayAnim }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              activeOpacity={1}
              onPress={() => closeMenu()}
            />
          </Animated.View>

          {/* Sheet */}
          <Animated.View
            style={[
              styles.menuSheet,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Handle */}
            <View
              style={[styles.sheetHandle, { backgroundColor: colors.border }]}
            />

            {/* Contact identity header */}
            <View style={styles.menuContactHeader}>
              <View style={styles.menuAvatarWrap}>
                {menuContact.avatar ? (
                  <Image
                    source={{ uri: menuContact.avatar }}
                    style={styles.menuAvatar}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient
                    colors={["#00d4aa", "#5b8dee"]}
                    style={styles.menuAvatarFallback}
                  >
                    <Text style={styles.menuAvatarInitials}>
                      {menuInitials}
                    </Text>
                  </LinearGradient>
                )}
                {menuContact.isOnline && (
                  <View
                    style={[
                      styles.menuOnlineDot,
                      { borderColor: colors.surface },
                    ]}
                  />
                )}
              </View>
              <View style={styles.menuContactInfo}>
                <Text
                  style={[
                    styles.menuContactName,
                    { color: colors.textPrimary },
                  ]}
                >
                  {menuContact.name}
                </Text>
                {menuContact.phone && (
                  <Text
                    style={[
                      styles.menuContactPhone,
                      { color: colors.textMuted },
                    ]}
                  >
                    {menuContact.phone}
                  </Text>
                )}
                <View
                  style={[
                    styles.menuOnlineChip,
                    {
                      backgroundColor: menuContact.isOnline
                        ? "rgba(0,212,170,0.1)"
                        : "rgba(85,85,119,0.1)",
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.menuOnlineChipDot,
                      {
                        backgroundColor: menuContact.isOnline
                          ? "#00d4aa"
                          : "#555577",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.menuOnlineChipText,
                      {
                        color: menuContact.isOnline ? "#00d4aa" : "#555577",
                      },
                    ]}
                  >
                    {menuContact.isOnline ? "Active now" : "Offline"}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[styles.menuDivider, { backgroundColor: colors.border }]}
            />

            {/* Actions */}
            {[
              {
                icon: "chatbubble-ellipses-outline",
                label: "Send a Message",
                sub: "Start or continue a conversation",
                color: "#00d4aa",
                bg: "rgba(0,212,170,0.1)",
                onPress: async () => {
                  try {
                    const res = await chatApi.createPrivateChat(
                      menuContact._id
                    );
                    if (res.success) router.push(`/chat/${res.data.chat._id}`);
                  } catch {}
                },
              },
              {
                icon: "call-outline",
                label: "Voice Call",
                sub: "Start an audio call",
                color: "#5b8dee",
                bg: "rgba(91,141,238,0.1)",
                onPress: () => {
                  router.push(`/call/${menuContact._id}?type=audio` as any);
                },
              },
              {
                icon: "videocam-outline",
                label: "Video Call",
                sub: "Start a video call",
                color: "#ff6b9d",
                bg: "rgba(255,107,157,0.1)",
                onPress: () => {
                  router.push(`/call/${menuContact._id}?type=video` as any);
                },
              },
              {
                icon: "person-outline",
                label: "View Profile",
                sub: "See full contact information",
                color: "#ffc107",
                bg: "rgba(255,193,7,0.1)",
                onPress: () => {
                  router.push(`/profile/${menuContact._id}` as any);
                },
              },
            ].map(({ icon, label, sub, color, bg, onPress }, i, arr) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.menuAction,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => handleAction(onPress)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuActionIcon, { backgroundColor: bg }]}>
                  <Ionicons name={icon as any} size={19} color={color} />
                </View>
                <View style={styles.menuActionText}>
                  <Text
                    style={[
                      styles.menuActionLabel,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {label}
                  </Text>
                  <Text
                    style={[styles.menuActionSub, { color: colors.textMuted }]}
                  >
                    {sub}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            ))}

            {/* Cancel */}
            <TouchableOpacity
              style={styles.menuCancel}
              onPress={() => closeMenu()}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.menuCancelText, { color: colors.textMuted }]}
              >
                Dismiss
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  contactsSection: { marginBottom: 4 },
  contactsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    marginBottom: 6,
  },
  contactsLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  seeAll: { fontSize: 12, color: "#00d4aa", fontWeight: "700" },
  contactsScroll: {
    paddingHorizontal: Spacing.base,
    gap: 14,
    paddingBottom: 8,
  },
  contactChip: { alignItems: "center", width: 52 },
  contactAvatarWrap: { position: "relative", marginBottom: 4 },
  contactAvatar: { width: 48, height: 48, borderRadius: 24 },
  contactAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInitials: { color: "#fff", fontSize: 15, fontWeight: "700" },
  contactOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  contactName: { fontSize: 11, textAlign: "center" },
  // Row layout shared by MessageResultRow (mirrors ChatItem's own styles)
  chatItem: { flexDirection: "row", paddingHorizontal: Spacing.base, gap: 12 },
  chatAvatarWrap: { position: "relative", marginTop: 10 },
  chatAvatar: { width: 50, height: 50, borderRadius: 25 },
  chatAvatarFallback: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  chatAvatarInitials: { color: "#fff", fontWeight: "700", fontSize: 17 },
  chatContent: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  chatTop: { flexDirection: "row", justifyContent: "space-between" },
  chatName: { fontSize: 15, fontWeight: "600", flex: 1, marginRight: 8 },
  chatTime: { fontSize: 12 },
  lastMessage: { fontSize: 13 },
  emptyWrap: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 13 },
  newChatBtn: {
    marginTop: 8,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  newChatGradient: { paddingHorizontal: 24, paddingVertical: 11 },
  newChatText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  fab: {
    position: "absolute",
    bottom: 92,
    right: 18,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#00d4aa",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  fabGradient: {
    width: 54,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  contactChipWrap: {
    alignItems: "center",
    width: 64,
    position: "relative",
  },
  contactMenuBtn: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 10,
  },
  menuSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingBottom: 36,
    zIndex: 11,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  menuContactHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 18,
    gap: 14,
  },
  menuAvatarWrap: { position: "relative" },
  menuAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  menuAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  menuAvatarInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  menuOnlineDot: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#00d4aa",
    borderWidth: 2,
  },
  menuContactInfo: { flex: 1, gap: 4 },
  menuContactName: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  menuContactPhone: {
    fontSize: 13,
    fontWeight: "500",
  },
  menuOnlineChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  menuOnlineChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  menuOnlineChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  menuAction: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  menuActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  menuActionText: { flex: 1 },
  menuActionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  menuActionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  menuCancel: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 4,
  },
  menuCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
