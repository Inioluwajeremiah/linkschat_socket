import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import AddImageUpdate from "../Components/AddImageUpdate";
import AddTextUpdate from "../Components/AddTextUpdate";
import { windowWidth } from "../utils/Dimensions";

const TabItems = [
  {
    title: "Image",
    value: "Image",
  },
  {
    title: "Text",
    value: "Text",
  },
];

const AddUpdateScreen = () => {
  const [activeButtonIndex, setActiveButtonIndex] = useState(1);

  const pagerViewRef = useRef(null);

  const handleTabPress = useCallback(
    (index) => {
      setActiveButtonIndex(index);
      pagerViewRef.current?.setPage(index);
    },
    [pagerViewRef]
  );
  return (
    <SafeAreaView
      style={{
        flex: 1,
        // paddingHorizontal: 20,
        backgroundColor: "#fff",
      }}
    >
      <PagerView
        ref={pagerViewRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={(e) => setActiveButtonIndex(e.nativeEvent.position)}
      >
        <AddImageUpdate key="1" />
        <AddTextUpdate key="2" />
      </PagerView>

      {/* image and text tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 100,
          padding: 10,
          position: "absolute",
          bottom: 0,
          width: windowWidth - 40,
          marginHorizontal: 20,
          zIndex: 1,
        }}
      >
        {TabItems.map((item, index) => (
          <TouchableOpacity
            onPress={() => handleTabPress(index)}
            key={index}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontSize: index === activeButtonIndex ? 16 : 14,
                fontWeight: index === activeButtonIndex ? "700" : "400",
                textAlign: "center",
                color: index === activeButtonIndex ? "#fff" : "#ccc",
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default AddUpdateScreen;
