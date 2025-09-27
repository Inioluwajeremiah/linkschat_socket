import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { windowHeight, windowWidth } from "../utils/Dimensions";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import IonIcons from "@expo/vector-icons/Ionicons";
import { Colors } from "../utils/Colors";
import { useNavigation } from "@react-navigation/native";

const UserContact = ({ item }) => {
  const navigation = useNavigation();
  const [showModal, setShowModal] = useState(false);
  const imageSize = windowWidth * 0.15;
  const iconSize = imageSize / 2;

  const ToggleModal = () => {
    setShowModal(!showModal);
  };
  if (item?.name === " null" && !item?.phoneNumbers) {
    return null;
  } else {
    return (
      <View>
        <TouchableOpacity
          onPress={ToggleModal}
          style={{
            width: "100%",
            backgroundColor: "white",
            marginTop: 20,
            alignSelf: "center",
            borderRadius: 16,
            height: 90,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            // Android Shadow
            elevation: 5,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {item?.image ? (
              <Image
                source={item?.image}
                style={{
                  width: imageSize,
                  height: imageSize,
                  borderRadius: imageSize,
                  borderWidth: 1,
                  borderColor: "#ccc",
                }}
              />
            ) : (
              <FontAwesome
                name="user-circle"
                size={imageSize}
                color="#5bbbdf"
              />
            )}
            <View style={{ maxWidth: windowWidth * 0.5 }}>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 14,
                  marginLeft: 10,
                  fontFamily: "regular",
                }}
              >
                {item?.name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  marginLeft: 10,
                  fontFamily: "regular",
                  marginTop: 4,
                }}
              >
                {/* {item?.phoneNumbers[0]?.number} */}
                {item?.phoneNumbers ? item?.phoneNumbers[0]?.number : ""}
              </Text>
            </View>
          </View>
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,

              padding: 10,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IonIcons
              name="call-outline"
              color={Colors.primaryColor}
              size={iconSize}
            />
          </View>
        </TouchableOpacity>

        <Modal transparent={true} visible={showModal} animationType="slide">
          <View style={{ flex: 1, height: windowHeight }}>
            <Pressable
              onPress={ToggleModal}
              style={{ width: "100%", height: "60%" }}
            />

            <ScrollView
              style={{
                width: "100%",
                height: "40%",
                marginTop: -20,
                backgroundColor: "#fff",
                borderTopRightRadius: 20,
                borderTopLeftRadius: 20,
                paddingHorizontal: 20,
              }}
            >
              <Text style={{ marginTop: 20, fontSize: 18, fontWeight: "600" }}>
                Select call type
              </Text>

              {/* call type option */}
              <View style={{ flexDirection: "column", gap: 10, marginTop: 16 }}>
                {/* voice call button */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CallScreen", { callType: "voice" })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <IonIcons
                    name="call-outline"
                    color={Colors.primaryColor}
                    size={iconSize}
                  />
                  <Text>Voice call</Text>
                </TouchableOpacity>

                {/* video call button */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("CallScreen", { callType: "video" })
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <IonIcons
                    name="videocam-outline"
                    color={Colors.primaryColor}
                    size={iconSize}
                  />
                  <Text>Video call</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
};

export default UserContact;
