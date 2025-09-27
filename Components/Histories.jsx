import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import History from "./History";
const Histories = () => {
  //   const callHistoryData = [
  //     {
  //       id: "",
  //       participants: [
  //         {
  //           userId: "",
  //           userName: "",
  //         },
  //       ],
  //       callType: "voice", // Options: "voice" | "video"
  //       direction: "incoming", // "incoming" or "outgoing"
  //       status: "missed", // Options: "connected" | "missed" | "declined" | "ended"
  //       startedAt: "",
  //       endedAt: "",
  //       duration: 0,
  //     },
  //   ];

  const callHistoryData = [
    {
      id: "call_001",
      participants: [
        { userId: "u001", userName: "Inioluwa" },
        { userId: "u002", userName: "Zainab" },
        { userId: "u003", userName: "David" },
      ],
      callType: "voice",
      direction: "incoming",
      status: "connected",
      startedAt: "2025-07-02T08:30:00Z",
      endedAt: "2025-07-02T08:45:00Z",
      duration: 900,
    },
    {
      id: "call_002",
      participants: [
        { userId: "u004", userName: "Chisom" },
        { userId: "u005", userName: "Amina" },
      ],
      callType: "video",
      direction: "outgoing",
      status: "missed",
      startedAt: "2025-07-01T14:00:00Z",
      endedAt: "",
      duration: 0,
    },
    {
      id: "call_003",
      participants: [
        { userId: "u006", userName: "Tunde" },
        { userId: "u007", userName: "Kelechi" },
        { userId: "u008", userName: "Fatima" },
      ],
      callType: "voice",
      direction: "incoming",
      status: "declined",
      startedAt: "2025-06-30T10:12:00Z",
      endedAt: "2025-06-30T10:12:30Z",
      duration: 30,
    },
    {
      id: "call_004",
      participants: [
        { userId: "u009", userName: "John" },
        { userId: "u010", userName: "Grace" },
        { userId: "u011", userName: "Michael" },
        { userId: "u012", userName: "Aisha" },
      ],
      callType: "video",
      direction: "outgoing",
      status: "connected",
      startedAt: "2025-06-29T19:20:00Z",
      endedAt: "2025-06-29T19:48:00Z",
      duration: 1680,
    },
    {
      id: "call_005",
      participants: [{ userId: "u013", userName: "Samuel" }],
      callType: "voice",
      direction: "incoming",
      status: "missed",
      startedAt: "2025-06-29T22:30:00Z",
      endedAt: "",
      duration: 0,
    },
    {
      id: "call_006",
      participants: [
        { userId: "u014", userName: "Ngozi" },
        { userId: "u015", userName: "Chuka" },
        { userId: "u016", userName: "Blessing" },
        { userId: "u017", userName: "Yusuf" },
      ],
      callType: "video",
      direction: "incoming",
      status: "connected",
      startedAt: "2025-06-28T09:00:00Z",
      endedAt: "2025-06-28T09:05:00Z",
      duration: 300,
    },
    {
      id: "call_007",
      participants: [
        { userId: "u018", userName: "Bola" },
        { userId: "u019", userName: "Emeka" },
      ],
      callType: "voice",
      direction: "outgoing",
      status: "ended",
      startedAt: "2025-06-27T17:00:00Z",
      endedAt: "2025-06-27T17:10:00Z",
      duration: 600,
    },
    {
      id: "call_008",
      participants: [
        { userId: "u020", userName: "Chinedu" },
        { userId: "u021", userName: "Titi" },
        { userId: "u022", userName: "Ibrahim" },
      ],
      callType: "video",
      direction: "incoming",
      status: "declined",
      startedAt: "2025-06-26T11:50:00Z",
      endedAt: "2025-06-26T11:50:10Z",
      duration: 10,
    },
    {
      id: "call_009",
      participants: [
        { userId: "u023", userName: "Ada" },
        { userId: "u024", userName: "Obinna" },
        { userId: "u025", userName: "Rita" },
        { userId: "u026", userName: "Bashir" },
        { userId: "u027", userName: "Halima" },
      ],
      callType: "voice",
      direction: "outgoing",
      status: "connected",
      startedAt: "2025-06-25T08:00:00Z",
      endedAt: "2025-06-25T08:25:00Z",
      duration: 1500,
    },
    {
      id: "call_010",
      participants: [
        { userId: "u028", userName: "Ifeanyi" },
        { userId: "u029", userName: "Khadija" },
        { userId: "u030", userName: "Daniel" },
        { userId: "u031", userName: "Glory" },
        { userId: "u032", userName: "Paul" },
        { userId: "u033", userName: "Mercy" },
        { userId: "u034", userName: "Victor" },
        { userId: "u035", userName: "Lilian" },
        { userId: "u036", userName: "Joseph" },
        { userId: "u037", userName: "Ola" },
        { userId: "u038", userName: "Joy" },
        { userId: "u039", userName: "Tommy" },
      ],
      callType: "video",
      direction: "outgoing",
      status: "connected",
      startedAt: "2025-06-24T18:00:00Z",
      endedAt: "2025-06-24T18:50:00Z",
      duration: 3000,
    },
    {
      id: "call_011",
      participants: [
        { userId: "u040", userName: "Hope" },
        { userId: "u041", userName: "Desmond" },
      ],
      callType: "voice",
      direction: "incoming",
      status: "connected",
      startedAt: "2025-06-23T06:30:00Z",
      endedAt: "2025-06-23T06:45:00Z",
      duration: 900,
    },
    {
      id: "call_012",
      participants: [
        { userId: "u042", userName: "Ahmed" },
        { userId: "u043", userName: "Beatrice" },
      ],
      callType: "video",
      direction: "outgoing",
      status: "ended",
      startedAt: "2025-06-22T13:00:00Z",
      endedAt: "2025-06-22T13:10:00Z",
      duration: 600,
    },
    {
      id: "call_013",
      participants: [
        { userId: "u044", userName: "Ken" },
        { userId: "u045", userName: "Gloria" },
        { userId: "u046", userName: "Segun" },
      ],
      callType: "voice",
      direction: "outgoing",
      status: "missed",
      startedAt: "2025-06-21T18:00:00Z",
      endedAt: "",
      duration: 0,
    },
    {
      id: "call_014",
      participants: [
        { userId: "u047", userName: "Temi" },
        { userId: "u048", userName: "Nkechi" },
        { userId: "u049", userName: "Mohammed" },
      ],
      callType: "video",
      direction: "incoming",
      status: "connected",
      startedAt: "2025-06-20T15:00:00Z",
      endedAt: "2025-06-20T15:35:00Z",
      duration: 2100,
    },
    {
      id: "call_015",
      participants: [
        { userId: "u050", userName: "Yemi" },
        { userId: "u051", userName: "Rachael" },
      ],
      callType: "voice",
      direction: "incoming",
      status: "declined",
      startedAt: "2025-06-19T10:00:00Z",
      endedAt: "2025-06-19T10:00:10Z",
      duration: 10,
    },
  ];

  return (
    <FlatList
      data={callHistoryData}
      renderItem={({ item }) => <History item={item} />}
      keyExtractor={(item) => item.id.toString()}
      style={{ paddingHorizontal: 20 }}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

export default Histories;

const styles = StyleSheet.create({});
