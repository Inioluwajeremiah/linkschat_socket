// import { View, Text } from "react-native";
// import React from "react";
// import { ZegoSendCallInvitationButton } from "@zegocloud/zego-uikit-prebuilt-call-rn";

// // receives recipient userID and userName as props

// const ZegoCloudCallModal = ({ userID, userName }) => {
//   return (
//     <View>
//       <ZegoSendCallInvitationButton
//         icon="phone"
//         text={"Send Video Call Invitation"}
//         invitees={[{ userID: userID, userName: userName }]}
//         isVideoCall={true}
//         resourceID={"zego_call"}
//       />

//       <ZegoSendCallInvitationButton
//         icon="phone"
//         text={"Send Audio Call Invitation"}
//         invitees={[{ userID: userID, userName: userName }]}
//         isVideoCall={false}
//         resourceID={"zego_call"}
//       />
//     </View>
//   );
// };

// export default ZegoCloudCallModal;

import { View, Text } from "react-native";
import React from "react";

const ZegoCloudCallModal = () => {
  return (
    <View>
      <Text>ZegoCloudCallModal</Text>
    </View>
  );
};

export default ZegoCloudCallModal;
