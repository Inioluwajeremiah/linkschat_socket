import { View } from "react-native";
import React from "react";
import SkeletonPlaceholder from "./SkeletonView";
import { windowWidth } from "../utils/Dimensions";
import { StyleSheet } from "react-native";

const imageSize = windowWidth * 0.15;

const ChatCardLoadingSkeleton = () => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
        backgroundColor: "white",
        gap: 10,
        marginBottom: 10,
        paddingVertical: 10,
        borderRadius: 10,
        maxHeight: imageSize + 20,
      }}
    >
      {/* image */}
      <SkeletonPlaceholder
        style={{
          width: imageSize,
          height: imageSize,
          borderWidth: 3,
          borderColor: "#5bbbdf",
          borderRadius: imageSize / 2,
          justifyContent: "center",
          alignItems: "center",
        }}
      />
      <View
        style={{
          flex: 1,
          // flexDirection: "column",
          // marginLeft: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            maxWidth: windowWidth,
          }}
        >
          {/* name */}
          <SkeletonPlaceholder
            style={{ width: windowWidth * 0.5, height: imageSize / 2 }}
          />
          {/* time */}
          <SkeletonPlaceholder
            style={{
              width: windowWidth * 0.15,
              height: windowWidth * 0.07,
            }}
          />
        </View>

        {/* last message */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 5,
          }}
        >
          {/* last message */}
          <SkeletonPlaceholder style={styles.box} />
          {/* <SkeletonPlaceholder style={styles.box} /> */}
        </View>
      </View>
    </View>
  );
};

export default ChatCardLoadingSkeleton;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  lineShort: {
    width: 150,
    height: 20,
    borderRadius: 4,
  },
  lineLong: {
    width: "90%",
    height: 20,
    borderRadius: 4,
  },
  box: {
    width: "100%",
    height: imageSize / 2,
    borderRadius: 8,
  },
});
