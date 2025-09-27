import {
  TextInput,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import Header from "../Components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Entypo from "@expo/vector-icons/Entypo";

const AddNewContact = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+234");
  const [mobilenumber, setMobilenumber] = useState();
  return (
    <SafeAreaView
      style={{
        backgroundColor: "white",
        flex: 1,
      }}
    >
      <KeyboardAvoidingView behavior="padding">
        <ScrollView style={{}} contentContainerStyle={{ flexGrow: 1 }}>
          <Header />

          <Text
            style={{
              fontWeight: "bold",
              fontSize: 20,
              fontFamily: "regular",
              marginHorizontal: 20,
              textAlign: "center",
              marginTop: 20,
            }}
          >
            Add New Contact
          </Text>

          <View style={{ position: "relative" }}>
            <View
              style={{
                width: 130,
                height: 130,
                borderWidth: 1,
                borderRadius: 65,
                borderColor: "#ccc",

                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 50,
                zIndex: -1,
              }}
            >
              <FontAwesome name="user-circle" size={64} color="#5bbbdf" />
            </View>
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 20,
                position: "absolute",
                top: 150,
                right: 130,
                backgroundColor: "white",
                zIndex: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Entypo name="plus" size={30} color="#5bbbdf" />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 40,
              paddingHorizontal: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                marginBottom: 10,

                fontFamily: "regular",
              }}
            >
              First Name
            </Text>
            <TextInput
              placeholderTextColor={"gray"}
              placeholder="First Name"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 5,
                fontSize: 16,
                paddingHorizontal: 10,
                marginBottom: 10,

                backgroundColor: "white",
                // iOS Shadow
              }}
            />

            <Text
              style={{
                fontSize: 14,
                marginBottom: 10,
                marginTop: 10,
                fontFamily: "regular",
              }}
            >
              Last Name
            </Text>
            <TextInput
              placeholderTextColor={"gray"}
              placeholder="Last Name"
              style={{
                height: 50,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
                fontSize: 16,
                paddingHorizontal: 10,
                marginBottom: 10,

                backgroundColor: "white",
                // iOS Shadow
              }}
            />

            <Text
              style={{
                fontSize: 14,
                marginTop: 10,
                marginBottom: 10,
                color: "black",
                fontFamily: "regular",
              }}
            >
              Mobile Number
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                style={{
                  width: 80,
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                }}
              >
                <Text>{selectedCountryCode}</Text>
              </TouchableOpacity>
              <TextInput
                keyboardType="numeric"
                placeholderTextColor={"gray"}
                placeholder="Enter Your Number"
                style={{
                  flex: 1,
                  height: 50,
                  borderWidth: 1,
                  borderColor: "#ccc",
                  borderRadius: 5,
                  fontSize: 18,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  fontFamily: "regular",
                }}
                onChangeText={(text) => setMobilenumber(text)}
              />
            </View>

            {/* add contact button */}
            <TouchableOpacity
              onPressOut={() => mull}
              style={{
                backgroundColor: "#5bbbdf",
                padding: 12,
                borderRadius: 10,
                marginTop: 20,
                // justifyContent:"center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                // Android Shadow
                elevation: 3,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 18,
                  fontWeight: "bold",
                  textAlign: "center",
                  fontFamily: "regular",
                }}
              >
                Add Contact
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {showModal && (
        <PhonetInputModal
          showModal={showModal}
          setShowModal={setShowModal}
          handleSelect={handleSelect}
          selectedCountryCode={selectedCountryCode}
        />
      )}
    </SafeAreaView>
  );
};

export default AddNewContact;

const styles = StyleSheet.create({});
