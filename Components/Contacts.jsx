import { View, Text, Image } from "react-native";
import React from "react";
import { ScrollView } from "react-native";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import man from "../assets/profile.png";
import woman from "../assets/woman.png";

export default function Contacts() {
  const services = [
    {
      id: 1,
      name: "Geniuska",
      image: man,
    },
    {
      id: 2,
      name: "imperatrice",
      image: woman,
    },
    {
      id: 3,
      name: "Gabriella",
      image: woman,
    },
    {
      id: 4,
      name: "Jacky",
      image: woman,
    },
    {
      id: 5,
      name: "Hayley",
      image: woman,
    },
    {
      id: 6,
      name: "Hawkins",
      image: woman,
    },
    {
      id: 7,
      name: "Mary",
      image: woman,
    },
    {
      id: 8,
      name: "Michael",
      image: man,
    },
  ];
  return (
    <View
      style={{
        borderBottomColor: "gray",
        borderBottomWidth: 0.5,
        marginTop: 10,
      }}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        {services.map((service, index) => (
          <TouchableOpacity
            key={index}
            style={{
              margin: 10,
              backgroundColor: "white",
              padding: 5,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderColor: "#ccc",
                gap: 10,
                position: "relative",
              }}
            >
              <View
                style={{
                  width: 70,
                  height: 70,
                  borderWidth: 3,
                  borderColor: "#5bbbdf",
                  borderRadius: 35,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={service.image}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,

                    //   aspectRatio:1,
                    //   resizeMode:"cover"
                  }}
                />
                <TouchableOpacity
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: "#5bbbdf",
                    position: "absolute",
                    top: 30,
                    right: -12,
                    borderWidth: 2,
                    borderColor: "white",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <AntDesign name="close" size={15} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
                marginTop: 10,
                fontFamily: "regular",
              }}
            >
              {service.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
