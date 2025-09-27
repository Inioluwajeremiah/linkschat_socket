import { useCallback } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { firestoreDatabase } from "../firebaseConfig";
// adjust the import path as needed

export const useLogCall = () => {
  const logCall = useCallback(
    async ({ callId, status = "ended", duration, participants }) => {
      if (!callId) {
        console.warn("logCall: callId is required");
        return;
      }

      const callRef = doc(firestoreDatabase, "calls", callId);

      await updateDoc(callRef, {
        status,
        endedAt: serverTimestamp(),
        duration,
        participants,
      });
    },
    []
  );

  return { logCall };
};
