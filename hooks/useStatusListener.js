import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { firestoreDatabase } from "../firebaseConfig";

const useStatusListener = () => {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    const statusRef = collection(firestoreDatabase, "status");

    const unsubscribe = onSnapshot(statusRef, (snapshot) => {
      const statusList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStatuses(statusList);
    });

    return () => unsubscribe(); // cleanup on unmount
  }, []);

  return statuses;
};

export default useStatusListener;
