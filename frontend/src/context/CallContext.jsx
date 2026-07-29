import { createContext } from "react";
import { useChatStore } from "../store/useChatStore";
import { useWebRTCCall } from "../hooks/useWebRTCCall";
import CallOverlay from "../components/CallOverlay";

const CallContext = createContext(null);
export { CallContext };

export function CallProvider({ children }) {
  const selectedUser = useChatStore((state) => state.selectedUser);
  const controller = useWebRTCCall(selectedUser);
  return <CallContext.Provider value={controller}>{children}<CallOverlay controller={controller} /></CallContext.Provider>;
}
