import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import Someone from "./Someone";
import { useSelector, useDispatch } from "react-redux";

const People = ({ setVisible, setSelected }) => {
  const people = useSelector((state) => state.contact.items);
  return (
    <FlatList
      data={people}
      renderItem={({ item }) => (
        <Someone
          item={item}
          setVisible={setVisible}
          setSelected={setSelected}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default People;

const styles = StyleSheet.create({});
