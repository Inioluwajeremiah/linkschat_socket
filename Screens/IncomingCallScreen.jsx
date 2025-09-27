// import React from "react";
// import { View, Text, Button, StyleSheet, Image } from "react-native";
// import { useNavigation } from "@react-navigation/native";
// import { doc, updateDoc } from "firebase/firestore";
// import { firestoreDatabase } from "../firebaseConfig";

// export default function IncomingCallScreen({ route }) {
//   const navigation = useNavigation();
//   const { roomId, callType, callDocId } = route.params;

//   const handleAccept = async () => {
//     await updateDoc(doc(firestoreDatabase, "calls", callDocId), {
//       status: "accepted",
//     });

//     navigation.replace("CallScreen", {
//       roomId,
//       userName: "You",
//       email: "",
//       avatar: "",
//     });
//   };

//   const handleReject = async () => {
//     await updateDoc(doc(db, "calls", callDocId), {
//       status: "rejected",
//     });
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Incoming {callType} Call</Text>
//       <Image
//         source={{ uri: "https://i.pravatar.cc/300" }}
//         style={styles.avatar}
//       />
//       <View style={styles.buttons}>
//         <Button title="Accept" color="green" onPress={handleAccept} />
//         <Button title="Reject" color="red" onPress={handleReject} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, justifyContent: "center", alignItems: "center" },
//   title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
//   avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 30 },
//   buttons: { flexDirection: "row", gap: 20 },
// });

// screens/IncomingCallScreen.js
import React from "react";
import { View, Text, Button, StyleSheet, Modal } from "react-native";

const IncomingCallScreen = ({ visible, callerId, onAccept, onReject }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <Text style={styles.text}>Incoming call from {callerId}</Text>

        <View style={styles.buttonGroup}>
          <Button title="Accept" onPress={onAccept} />
          <Button title="Reject" onPress={onReject} color="red" />
        </View>
      </View>
    </Modal>
  );
};

export default IncomingCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    color: "white",
    fontSize: 18,
    marginBottom: 20,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 20,
  },
});
