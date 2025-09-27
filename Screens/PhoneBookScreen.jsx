import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState, useMemo, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import IonIcons from "@expo/vector-icons/Ionicons";
import { TextInput } from "react-native-gesture-handler";
import UserContact from "../Components/UserContact";
import * as Contacts from "expo-contacts";
import { Colors } from "../utils/Colors";

const PhoneBookScreen = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  const ToggleSearch = () => {
    setShowSearch(!showSearch);
  };

  // Filter contacts by name based on search input
  const filteredContacts = useMemo(() => {
    return contacts.filter((item) =>
      item?.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, contacts]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        setLoading(true);
        const { data } = await Contacts.getContactsAsync({
          //   fields: [Contacts.Fields.Emails],
        });

        // console.log("contacts data ===> ", data[0]);

        if (data.length > 0) {
          //   const contact = data[0];
          const sortedContacts = data.sort(
            (a, b) => a?.name?.localeCompare(b?.name ?? "") ?? 0
          );
          setContacts(sortedContacts);
          setLoading(false);
        }
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} color={Colors.primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* header */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity>
            <IonIcons name="arrow-back-outline" size={24} color={"black"} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontWeight: "700" }}>Select contact</Text>
            <Text>{filteredContacts?.length} contacts</Text>
          </View>
        </View>

        <TouchableOpacity onPress={ToggleSearch}>
          <IonIcons
            name={showSearch ? "close-outline" : "search-outline"}
            size={24}
            color={"black"}
          />
        </TouchableOpacity>
      </View>
      {showSearch && (
        <View
          style={{
            marginHorizontal: 20,
            marginTop: 16,
            borderRadius: 16,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: "#ccc",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{ paddingRight: 5 }}
            onPress={searchText ? () => setSearchText("") : null}
          >
            <IonIcons
              name={searchText ? "close-outline" : "search-outline"}
              size={24}
              color={"black"}
            />
          </TouchableOpacity>
          <TextInput
            placeholder="Search..."
            cursorColor={"#ccc"}
            value={searchText}
            style={{ flex: 1 }}
            onChangeText={(text) => setSearchText(text)}
          />
        </View>
      )}

      {/* show contacts */}

      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filteredContacts}
        renderItem={({ item }) => <UserContact item={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default React.memo(PhoneBookScreen);
