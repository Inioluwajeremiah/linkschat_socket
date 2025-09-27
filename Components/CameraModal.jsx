import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import { Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import IonIcons from "@expo/vector-icons/Ionicons";
import { windowWidth } from "../utils/Dimensions";
import { SafeAreaView } from "react-native-safe-area-context";

const imageSize = windowWidth * 0.15;
const iconSize = imageSize / 2;

export default function CameraModal({
  permission,
  requestPermission,
  setImagePath,
  setShowCamera,
}) {
  const [facing, setFacing] = useState("back");
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const handleTakePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      // console.log("handleTakePicture ==>> ", photo);
      setImagePath(photo);
      setShowCamera(false);
    }
  };

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <SafeAreaView style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
              paddingTop: 20,
            }}
          >
            <TouchableOpacity
              onPressIn={() => setShowCamera(false)}
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <IonIcons name={"close-outline"} size={iconSize} color={"#fff"} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={toggleCameraFacing}
            >
              <IonIcons
                name={
                  facing === "front"
                    ? "camera-outline"
                    : "camera-reverse-outline"
                }
                size={iconSize}
                color={"#fff"}
              />
            </TouchableOpacity>
          </View>
          {/* capture image button */}
          <View
            style={{
              position: "absolute",
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "center",
              backgroundColor: "transparent",
              bottom: 60,
              gap: 10,
            }}
          >
            <TouchableOpacity
              onPress={handleTakePicture}
              style={{
                width: imageSize,
                height: imageSize,
                borderRadius: iconSize,
                backgroundColor: "red",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IonIcons
                name={"camera-outline"}
                size={iconSize}
                color={"#fff"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: imageSize / 1.3,
    height: imageSize / 1.3,
    padding: 8,
    borderRadius: iconSize,
  },

  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
