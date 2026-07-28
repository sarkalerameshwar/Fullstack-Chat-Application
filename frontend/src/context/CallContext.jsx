import { createContext, useContext } from "react";
import { useChatStore } from "../store/useChatStore";
import { useWebRTCCall } from "../hooks/useWebRTCCall";
import CallOverlay from "../components/CallOverlay";

const CallContext = createContext(null);
export function CallProvider({ children }) {
  const selectedUser = useChatStore((state) => state.selectedUser);
  const controller = useWebRTCCall(selectedUser);
  return <CallContext.Provider value={controller}>{children}<CallOverlay controller={controller} /></CallContext.Provider>;
}
export const useCall = () => useContext(CallContext);
