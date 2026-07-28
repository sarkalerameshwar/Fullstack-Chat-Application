import { Phone, Video, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = ({ onAudioCall, onVideoCall }) => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, socketConnected } = useAuthStore();
  const isOnline = onlineUsers.includes(String(selectedUser._id));

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.username} />
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.username}</h3>
            <p className="text-sm text-base-content/70">
              {socketConnected ? (isOnline ? "Online" : "Offline") : "Connecting…"}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onAudioCall} disabled={!isOnline || !socketConnected} title={isOnline ? "Start voice call" : "User is offline"} aria-label="Start audio call"><Phone size={19} /></button>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={onVideoCall} disabled={!isOnline || !socketConnected} title={isOnline ? "Start video call" : "User is offline"} aria-label="Start video call"><Video size={19} /></button>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setSelectedUser(null)} aria-label="Close chat"><X /></button>
        </div>
      </div>
    </div>
  );
};
export default ChatHeader;
