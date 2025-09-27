import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useState, useEffect } from "react";
import Gifts from "./Gifts";
import { useSelector, useDispatch } from "react-redux";

const GiftHistories = () => {
  const [data, setData] = useState(null);
  const contacts = useSelector((state) => state.gift.items);
  // console.log(contacts);
  useEffect(() => {
    setData(contacts);
  }, [contacts]);

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Gifts item={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default GiftHistories;

const styles = StyleSheet.create({});
