import {
  CallingState,
  OutgoingCall,
  useCall,
  useCalls,
  useCallStateHooks,
} from "@stream-io/video-react-native-sdk";

const CallPanel = () => {
  const call = useCall();
  const isCallCreatedByMe = call?.data?.created_by.id === call?.currentUserId;
  const { useCallCallingState } = useCallStateHooks();

  const callingState = useCallCallingState();

  // Display the outgoing call if the call state is RINGING and the call is created by me.
  if (callingState === CallingState.RINGING && isCallCreatedByMe) {
    return <OutgoingCall />;
  }
};

const OutgoingCall = () => {
  const calls = useCalls();

  return (
    <StreamCall call={call[0]}>
      <CallPanel />
    </StreamCall>
  );
};

export default OutgoingCall;
