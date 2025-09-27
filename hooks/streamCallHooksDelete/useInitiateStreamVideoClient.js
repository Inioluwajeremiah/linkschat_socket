import { useEffect, useState } from "react";
import { StreamVideoClient } from "@stream-io/video-react-native-sdk";
import { useDispatch } from "react-redux";
import { setStreamClient } from "../../Store/slices/streamSlice";
import { APIEndPoints } from "../../utils/ApiEndpoints";

export function useInitiateStreamVideoClient() {
  const dispatch = useDispatch();
  //   const user = { id: "sara" };
  // const apiKey = "my-stream-api-key";
  // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
  // const client = StreamVideoClient.getOrCreateInstance({ apiKey, token, user });

  // const [client, setClient] = useState(null);

  const apiKey = APIEndPoints.STREAM_API_KEY;
  const user = { id: APIEndPoints.userID, name: "Sara" };
  const token = APIEndPoints.STREAM_TOKEN;

  console.log("useInitiateStreamVideoClient ==>> ", apiKey, user, token);

  const client = StreamVideoClient.getOrCreateInstance({
    apiKey,
    user,
    token,
    options: {
      maxConnectUserRetries: 3,
      onConnectUserError: (err, allErrors) => {
        console.error("Failed to connect user", err, allErrors);
      },
    },
  });
  return client;
}

//   // useEffect(() => {
//   //   if (!apiKey || !user || !token) return;

//   //   const myClient = StreamVideoClient.getOrCreateInstance({
//   //     apiKey,
//   //     user,
//   //     token,
//   //     options: {
//   //       maxConnectUserRetries: 3,
//   //       onConnectUserError: (err, allErrors) => {
//   //         console.error("Failed to connect user", err, allErrors);
//   //       },
//   //     },
//   //   });
//   //   // console.log(
//   //   //   "Stream Video Client at useInitiateStreamVideoClient:",
//   //   //   myClient
//   //   // );
//   //   setClient(myClient);
//   //   dispatch(setStreamClient(myClient));
//   //   return () => {
//   //     myClient.disconnectUser();
//   //     setClient(null);
//   //     dispatch(setStreamClient(null));
//   //   };
//   // }, []);
//   // apiKey, user, token

//   return client;
// }

// import { useEffect, useState } from "react";
// import { StreamVideoClient } from "@stream-io/video-react-native-sdk";
// import { useDispatch } from "react-redux";
// import { setStreamClient } from "../../Store/slices/streamSlice";
// import { APIEndPoints } from "../../utils/ApiEndpoints";

// const useInitiateStreamVideoClient = () => {
//   const dispatch = useDispatch();
//   const [client, setClient] = useState(null);

//   useEffect(() => {
//     const apiKey = APIEndPoints.STREAM_API_KEY;
//     const user = { id: APIEndPoints.userID, name: "Sara" };
//     const token = APIEndPoints.STREAM_TOKEN;

//     if (!apiKey || !user || !token) return;

//     const myClient = StreamVideoClient.getOrCreateInstance({
//       apiKey,
//       user,
//       token,
//       options: {
//         maxConnectUserRetries: 3,
//         onConnectUserError: (err, allErrors) => {
//           console.error("Failed to connect user", err, allErrors);
//         },
//       },
//     });

//     setClient(myClient);
//     dispatch(setStreamClient(myClient));

//     return () => {
//       myClient.disconnectUser();
//       setClient(null);
//       dispatch(setStreamClient(null));
//     };
//   }, []);

//   return client;
// };
// export default useInitiateStreamVideoClient;
