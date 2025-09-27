// // presence.js
// import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
// import { firestoreDatabase } from "../firebaseConfig";

// export const setUserOnline = async (userId) => {
//   await setDoc(doc(firestoreDatabase, "presence", userId), {
//     online: true,
//     lastSeen: serverTimestamp(),
//   });
// };

// export const setUserOffline = async (userId) => {
//   await setDoc(doc(firestoreDatabase, "presence", userId), {
//     online: false,
//     lastSeen: serverTimestamp(),
//   });
// };

// export const getUserStatus = async (userId) => {
//   try {
//     const docRef = doc(firestoreDatabase, "presence", userId);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       return {
//         online: data.online,
//         lastSeen: data.lastSeen?.toDate() || null,
//       };
//     } else {
//       return { online: false, lastSeen: null }; // default if no record
//     }
//   } catch (error) {
//     console.error("Error fetching user status:", error);
//     return null;
//   }
// };

import firestore from "@react-native-firebase/firestore";

export const setUserOnline = async (userId) => {
  await firestore().collection("presence").doc(userId).set({
    online: true,
    lastSeen: firestore.FieldValue.serverTimestamp(),
  });
};

export const setUserOffline = async (userId) => {
  await firestore().collection("presence").doc(userId).set({
    online: false,
    lastSeen: firestore.FieldValue.serverTimestamp(),
  });
};

export const getUserStatus = async (userId) => {
  try {
    const docSnap = await firestore().collection("presence").doc(userId).get();

    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        online: data.online,
        lastSeen: data.lastSeen?.toDate() || null,
      };
    } else {
      return { online: false, lastSeen: null };
    }
  } catch (error) {
    console.error("Error fetching user status:", error);
    return null;
  }
};
