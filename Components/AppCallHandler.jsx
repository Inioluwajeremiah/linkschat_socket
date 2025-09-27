import {
  StreamCall,
  StreamCallUI,
  useCalls,
} from "@stream-io/video-react-native-sdk";

function AppCallHandler() {
  const calls = useCalls();
  const activeCall = calls[0]; // or find call by some logic

  if (!activeCall) {
    return null; // no call in progress
  }

  return (
    <StreamCall call={activeCall}>
      <StreamCallUI />
    </StreamCall>
  );
}

export default AppCallHandler;
