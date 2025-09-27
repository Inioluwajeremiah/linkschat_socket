// import { useCallback } from "react";
// import {
//   collectionGroup,
//   getDocs,
//   query,
//   where,
//   writeBatch,
//   doc,
// } from "firebase/firestore";
// import { firestoreDatabase } from "../firebaseConfig";

// const useUpdateMessageStatus = () => {
//   const updateMessage = useCallback(
//     async (currentUserId, fromChatBox, newStatus) => {
//       if (!currentUserId) return;

//       try {
//         const q = fromChatBox
//           ? query(
//               collectionGroup(firestoreDatabase, "messages"),
//               where("receiverId", "==", currentUserId),
//               where("status", "==", "DELIVERED")
//             )
//           : query(
//               collectionGroup(firestoreDatabase, "messages"),
//               where("receiverId", "==", currentUserId),
//               where("status", "==", "UNREAD")
//             );

//         const snapshot = await getDocs(q);

//         if (snapshot.empty) {
//           // console.log("No SENT messages found for this user.");
//           return;
//         }

//         const batch = writeBatch(firestoreDatabase);

//         snapshot.forEach((docSnap) => {
//           const docRef = doc(firestoreDatabase, docSnap.ref.path);
//           batch.update(docRef, { status: newStatus });
//         });

//         await batch.commit();
//         // console.log("All SENT messages marked as DELIVERED.");
//       } catch (error) {
//         // console.error("Error updating message statuses:", error);
//       }
//     },
//     []
//   );

//   return { updateMessage };
// };

// export default useUpdateMessageStatus;

// import firestore from "@react-native-firebase/firestore";

// const useUpdateMessageStatus = () => {
//   const updateMessage = async (
//     chatId,
//     currentUserId,
//     fromChatBox,
//     newStatus
//   ) => {
//     console.log("chat id at useUpdateMessageStatus ==>> ", chatId);
//     console.log("currentUserId at useUpdateMessageStatus ==>> ", currentUserId);
//     if (!currentUserId || !chatId) return;

//     try {
//       // Point to messages subcollection under a specific chat
//       let q = firestore()
//         .collection("chats")
//         .doc(chatId)
//         .collection("messages")
//         .where("receiverId", "==", currentUserId);

//       if (fromChatBox) {
//         q = q.where("status", "==", "DELIVERED");
//       } else {
//         q = q.where("status", "==", "SENT");
//       }

//       const snapshot = await q.get();

//       if (snapshot.empty) {
//         return;
//       }

//       const batch = firestore().batch();

//       snapshot.forEach((docSnap) => {
//         const docRef = docSnap.ref; // direct doc ref
//         batch.update(docRef, { status: newStatus });
//       });

//       await batch.commit();
//       // console.log("Messages updated successfully");
//     } catch (error) {
//       console.error("Error updating message statuses:", error);
//     }
//   };

//   return { updateMessage };
// };

// export default useUpdateMessageStatus;

import firestore from "@react-native-firebase/firestore";

const useUpdateMessageStatus = () => {
  const updateMessage = async (
    chatId,
    currentUserId,
    fromChatBox,
    newStatus
  ) => {
    if (!currentUserId || !chatId) return;

    try {
      // Select messages addressed to the current user
      let q = firestore()
        .collection("chats")
        .doc(chatId)
        .collection("messages")
        .where("receiverId", "==", currentUserId);

      // If inside chatbox, mark DELIVERED → READ
      if (fromChatBox) {
        q = q.where("status", "==", "DELIVERED");
      } else {
        // If outside chatbox, mark SENT → DELIVERED
        q = q.where("status", "==", "SENT");
      }

      const snapshot = await q.get();

      if (snapshot.empty) return;

      const batch = firestore().batch();

      snapshot.forEach((docSnap) => {
        batch.update(docSnap.ref, { status: newStatus, updatedAt: Date.now() });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error updating message statuses:", error);
    }
  };

  return { updateMessage };
};

export default useUpdateMessageStatus;
