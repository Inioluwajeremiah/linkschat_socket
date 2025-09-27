import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Invite from "./Invite";
import * as Contacts from "expo-contacts";
import { TextInput } from "react-native";
import Octicons from "@expo/vector-icons/Octicons";

const Invites = () => {
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        setLoading(true);
        const { data } = await Contacts.getContactsAsync({
          //   fields: [Contacts.Fields.Emails],
        });

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

  // Filter contacts by name based on search input
  const filteredContacts = useMemo(() => {
    return contacts.filter((item) =>
      item?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, contacts]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"small"} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* search box */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 20,
          borderWidth: 1,
          borderColor: "#ddd",
          padding: 10,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "center",
        }}
      >
        <Octicons name="search" size={24} color="#ddd" />
        <TextInput
          placeholder="Search..."
          placeholderTextColor={"gray"}
          value={searchTerm}
          cursorColor={"gray"}
          style={{
            paddingHorizontal: 10,
            flex: 1,
          }}
          onChangeText={(text) => setSearchTerm(text)}
        />
      </View>

      <FlatList
        keyboardShouldPersistTaps="handled"
        data={filteredContacts}
        renderItem={({ item }) => <Invite item={item} />}
        keyExtractor={(item) => item.id.toString()}
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      />
    </View>
  );
};

export default Invites;

const styles = StyleSheet.create({});
