import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import man from "../assets/profile.png";
import woman from "../assets/woman.png";

import StarMessage from "./StarMessage";

const StarMessages = () => {
  const messages = [
    {
      id: 1,
      text: "Hello",
      sender: "Hayley",
      time: "10:00 AM",
      image: woman,
      isSent: false,
    },
    {
      id: 2,
      text: "I love to Deejoft technologies.",
      sender: "Hawkins",
      time: "Last Seen:10 minutes ago",
      image: woman,

      isSent: true,
    },
    {
      id: 3,
      text: "Hello",
      sender: "Gabreilla",
      time: "01:00pm",
      image: woman,

      isSent: true,
    },
    {
      id: 4,
      text: "I love to Deejoft technologies.",
      sender: "Elon",
      time: "12:07pm",
      image: man,

      isSent: true,
      isPin: true,
      isOnline: true,
    },
    {
      id: 5,
      text: "Hello",
      sender: "Eliana",
      time: "10:00 AM",
      image: woman,

      isSent: false,
    },

    {
      id: 6,
      text: "Hello",
      sender: "Eliora",
      time: "10:00 AM",
      image: woman,
      isSent: false,
      isPin: false,
      isOnline: true,
    },

    {
      id: 7,
      text: "Hello",
      sender: "John",
      time: "10:00 AM",
      image: man,

      isSent: false,
      isPin: true,
      isOnline: true,
    },
    {
      id: 8,
      text: "I love to Deejoft technologies.",
      sender: "Kings",
      time: "02/01/2025",
      image: man,

      isSent: true,
      isPin: true,
      isOnline: true,
    },
  ];
  return (
    <FlatList
      data={messages}
      renderItem={({ item }) => <StarMessage item={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};

export default StarMessages;

const styles = StyleSheet.create({});
