import { View, Text, Image } from "react-native";
import logo from "../assets/newlogo.jpeg";
import React, { useState } from "react";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Divider } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import LogoutModal from "./LogoutModal";

export default function CustomDrawer(props) {
  const [visible, setVisible] = useState(false);

  const navigation = useNavigation();
  const logOut = () => {
    navigation.navigate("Login");
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ backgroundColor: "white" }}
      >
        <View
          style={{
            // padding: 20,
            paddingVertical: 10,
            backgroundColor: "white",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Image
            source={logo}
            style={{
              width: 40,
              height: 40,

              // iOS Shadow
              // justifyContent:"center",
              // alignItems:"center",
              // iOS Shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.2,
              shadowRadius: 5,
              // Android Shadow
              elevation: 5,
            }}
          />
          <Text
            style={{
              fontSize: 25,
              fontWeight: "bold",
              color: "#243c56",

              marginLeft: 10,
              textAlign: "center",
            }}
          >
            LinksChat
          </Text>
        </View>
        <Divider width={0.5} />
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: 10 }}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      {/* <View
          style={{
            borderTopWidth: 1,
            borderColor: "#ddd",
            marginBottom: 20,
            padding: 10,
            backgroundColor: "white",

          }}
        >
           <TouchableOpacity
            style={{
              flexDirection: "row",
              marginHorizontal: 10,
              alignItems:"center",
              marginVertical: 5,
           
            }}
            onPress={()=>setVisible(true)}
          >
            <Feather name="log-out" color="#243c56" size={20} />
            <Text
              style={{
             
                fontSize: 18,
                fontWeight: "bold",
                color: "#243c56",
                fontFamily:"regular",
                marginLeft:10
             
              }}
            >
              Log out
            </Text>
          </TouchableOpacity>
          
        </View> */}
      <LogoutModal visible={visible} setVisible={setVisible} />
    </View>
  );
}
