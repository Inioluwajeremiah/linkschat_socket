import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";

import ShowContact from "./showcontact";
import user from "../assets/user.png";

const ShowContacts = () => {
  const contacts = [
    {
      id: 1,
      text: "Hello",
      sender: "Hayley",
      time: "10:00 AM",
      image: user,
      isSent: false,
    },
    {
      id: 2,
      text: "I love to Deejoft technologies.",
      sender: "Hawkins",
      time: "yesterday",
      image: user,
      isSent: true,
    },
    {
      id: 3,
      text: "Hello",
      sender: "Mary",
      time: "Today",
      image: user,
      isSent: false,
    },
    {
      id: 4,
      text: "I love to Deejoft technologies.",
      sender: "Jacky",
      time: "yesterday",
      image: user,

      isSent: true,
      isPin: true,
      isOnline: true,
    },
    {
      id: 5,
      text: "Hello",
      sender: "Trunk",
      time: "10:00 AM",
      image: user,

      isSent: false,
    },

    {
      id: 6,
      text: "Hello",
      sender: "Peter Pan",
      time: "10:00 AM",
      image: user,
      isSent: false,
      isPin: false,
      isOnline: true,
    },

    {
      id: 7,
      text: "Hello peter",
      sender: "Gabriel",
      time: "10:00 AM",
      image: user,

      isSent: false,
      isPin: true,
      isOnline: true,
    },
    {
      id: 8,
      text: "I love to use facebook",
      sender: "Kings",
      time: "02/01/2025",
      image: user,

      isSent: true,
      isPin: true,
      isOnline: true,
    },
  ];
  return (
    <FlatList
      data={contacts}
      renderItem={({ item }) => <ShowContact item={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default ShowContacts;

const styles = StyleSheet.create({});
