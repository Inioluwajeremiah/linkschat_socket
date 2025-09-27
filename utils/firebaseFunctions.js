// const functions = require("firebase-functions");
// const admin = require("firebase-admin");

// admin.initializeApp();
// const db = admin.firestore();

// exports.sendCallNotification = functions.firestore
//   .document("calls/{callId}")
//   .onCreate(async (snap, context) => {
//     // to make sure the function triggers only on document creation
//     const call = snap.data();

//     // ✅ Validate necessary fields
//     if (
//       !call ||
//       !call.receiverId ||
//       !call.roomId ||
//       !call.callerId ||
//       !call.type
//     ) {
//       console.warn("Missing required call fields");
//       return;
//     }

//     const receiverRef = db.collection("users").doc(call.receiverId);
//     const receiverDoc = await receiverRef.get();

//     if (!receiverDoc.exists) {
//       console.warn("Receiver user not found");
//       return;
//     }

//     const receiverData = receiverDoc.data();

//     // ✅ Optional: skip push if user is online (adjust based on how you set online status)
//     if (receiverData.isOnline) {
//       console.log("Receiver is online — skipping push notification");
//       return;
//     }

//     const fcmToken = receiverData.fcmToken;
//     if (!fcmToken) {
//       console.warn("No FCM token found for receiver");
//       return;
//     }

//     const payload = {
//       notification: {
//         title: "📞 Incoming Linkschat Call",
//         body: `${call.callerName || "Someone"} is calling you`,
//       },
//       data: {
//         roomId: call.roomId,
//         callerId: call.callerId,
//         callType: call.type, // "audio" or "video"
//         callDocId: context.params.callId,
//       },
//       token: fcmToken,
//     };

//     try {
//       await admin.messaging().send(payload);
//       console.log("✅ Push notification sent to", call.receiverId);
//     } catch (err) {
//       console.error("❌ Error sending notification:", err);
//     }
//   });
