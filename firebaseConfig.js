// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//   apiKey: "AIzaSyADjNfw3DFETQR_mtkdVKJRerw_MWW_6d4",
//   authDomain: "linkschat-21e01.firebaseapp.com",
//   projectId: "linkschat-21e01",
//   storageBucket: "linkschat-21e01.firebasestorage.app",
//   messagingSenderId: "198611237536",
//   appId: "1:198611237536:web:10daa98881415e6cbe27c5",
//   measurementId: "G-RDQP6YWD6V",
// };

// // Initialize Firebase
// export const app = initializeApp(firebaseConfig);
// export const firebaseStorage = getStorage(app);
// export const firestoreDatabase = getFirestore(app);

// test rule

// rules_version = '2';

// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
//       allow read, write: if
//           request.time < timestamp.date(2025, 7, 21);
//     }
//   }
// }

// production rule
// rules_version = '2';

// service firebase.storage {
//   match /b/{bucket}/o {
//     match /{allPaths=**} {
//       allow read, write: if false;
//     }
//   }
// }
