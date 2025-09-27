// link1 = https://getstream.io/video/docs/api/authentication/
// link2 = https://getstream.io/video/docs/react-native/guides/client-auth/
// link3 = https://getstream.io/video/docs/react-native/guides/joining-and-creating-calls/

// 1. register user in register screen.  (link1)
// 2. login user in login screen. At this point generate token (link1)
// 3. save token in redux toolkit woith redux persist and also set token expiration to login expiration (link1)
// 4. go to link2 and initiate client, save client in a context provider or use

// import { useEffect, useState } from "react";
// import {
//   StreamVideo,
//   StreamVideoClient,
//   User,
// } from "@stream-io/video-react-native-sdk";

// const apiKey = "my-stream-api-key";
// const user: User = { id: "sara", name: "Sara" };

// export const MyApp = () => {
//   const [client, setClient] = useState<StreamVideoClient>();
//   useEffect(() => {
//     const tokenProvider = () => Promise.resolve("<token>");
//     const myClient = StreamVideoClient.getOrCreateInstance({
//       apiKey,
//       user,
//       tokenProvider,
//     });
//     setClient(myClient);
//     return () => {
//       myClient.disconnectUser();
//       setClient(undefined);
//     };
//   }, []);

//   if (!client) return null;

//   return (
//     <StreamVideo client={client}>
//        <Stack.Screen name="Home" component={DrawerStack} />
//         <Stack.Screen name="Profile" component={Profile} />
//         {/* <Stack.Screen name="Setting" component={Settings} /> */}
//         <Stack.Screen name="chat-details" component={ChatDetails} />
//         <Stack.Screen name="Gift" component={GiftSomeone} />
//         <Stack.Screen name="AddUpdateScreen" component={AddUpdateScreen} />
//         <Stack.Screen name="ViewUpdateScreen" component={ViewUpdateScreen} />
//         <Stack.Screen name="VoiceCallScreen" component={VoiceCallScreen} />
//         <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
//         <Stack.Screen name="CallScreen" component={CallScreen} />
//         <Stack.Screen
//           name="IncomingCallScreen"
//           component={IncomingCallScreen}
//         />
//         <Stack.Screen
//           name="AllRegisteredUsersScreen"
//           component={AllRegisteredUsersScreen}
//         />
//     </StreamVideo>

//     // we may have to create a new scren for the abpve such that  StreamVideo context provider is used to rap them and we can
//     pass the client prop into it. we can get token from our login and pass it to this screen and and other users to get client frm StreamVideo
//     client is just user details
//   );
// };

// 5. then we can no move to creating call using link 3
