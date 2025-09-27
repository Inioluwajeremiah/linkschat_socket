// import { useEffect, useState } from "react";
// import { doc, onSnapshot } from "firebase/firestore";
// import { firestoreDatabase } from "../firebaseConfig";

// export default function useGetUserStatus(userId) {
//   const [status, setStatus] = useState({ online: false, lastSeen: null });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!userId) return;

//     const docRef = doc(firestoreDatabase, "presence", userId);

//     const unsubscribe = onSnapshot(
//       docRef,
//       (docSnap) => {
//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setStatus({
//             online: data.online,
//             lastSeen: data.lastSeen?.toDate() || null,
//           });
//         } else {
//           setStatus({ online: false, lastSeen: null });
//         }
//         setLoading(false);
//       },
//       (error) => {
//         console.error("Error listening for user status:", error);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe();
//   }, [userId]);

//   return { status, loading };
// }

import { useEffect, useState } from "react";
import firestore from "@react-native-firebase/firestore";

export default function useGetUserStatus(userId) {
  const [status, setStatus] = useState({ online: false, lastSeen: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection("presence")
      .doc(userId)
      .onSnapshot(
        (docSnap) => {
          if (docSnap.exists) {
            const data = docSnap.data();
            setStatus({
              online: data?.online,
              lastSeen: data?.lastSeen?.toDate() || null,
            });
          } else {
            setStatus({ online: false, lastSeen: null });
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error listening for user status:", error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [userId]);

  return { status, loading };
}
