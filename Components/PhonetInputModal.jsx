import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from "react-native";
import React, { useMemo, useState } from "react";
import { CountryCodes } from "../utils/CountryCodes"; // Ensure this has dial_code, code, and optionally name

const PhoneInputModal = ({
  showModal,
  setShowModal,
  selectedCountryCode,
  handleSelect,
}) => {
  const [search, setSearch] = useState("");

  // Filter country codes based on search input
  const filteredCodes = useMemo(() => {
    return CountryCodes.filter((item) =>
      item.dial_code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.countryCodeItem}
      onPress={() => {
        handleSelect(item.dial_code);
        setShowModal(false);
      }}
    >
      <Text style={styles.countryDial}>{item.dial_code}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Text style={styles.countryCode}>{item.name}</Text>
        <Text style={styles.countryCode}>{item.code}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal transparent={true} visible={showModal} animationType="slide">
      <View style={styles.overlay}>
        <Pressable
          onPress={() => setShowModal(false)}
          style={styles.topDismissArea}
        />

        <View style={styles.dropdown}>
          <TextInput
            placeholder="+1"
            style={styles.filterInput}
            cursorColor="#ccc"
            placeholderTextColor="gray"
            onChangeText={setSearch}
            value={search}
          />

          <FlatList
            data={filteredCodes}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            style={styles.flatList}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  topDismissArea: {
    flex: 0.15,
  },
  dropdown: {
    flex: 0.85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: "#D1D5DB",
    paddingTop: 16,
  },
  filterInput: {
    fontFamily: "inter",
    fontSize: 14,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  countryCodeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#D1D5DB",
  },
  countryDial: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  countryCode: {
    fontSize: 14,
    color: "#000",
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default PhoneInputModal;
