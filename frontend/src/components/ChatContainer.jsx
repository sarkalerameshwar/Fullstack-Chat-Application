import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, X } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useCall } from "../hooks/useCall";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
  } = useChatStore();
  const { authUser, socket } = useAuthStore();
  const { typingUserId, setTypingUserId } = useChatStore();
  const messageEndRef = useRef(null);
  const [fullImage, setFullImage] = useState(null);
  const call = useCall();

  useEffect(() => {
    getMessages(selectedUser._id);

  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const onTyping = ({ from }) => String(from) === String(selectedUser._id) && setTypingUserId(String(from));
    const onStopTyping = ({ from }) => String(from) === String(selectedUser._id) && setTypingUserId(null);
    socket.on("typing", onTyping);
    socket.on("stop-typing", onStopTyping);
    return () => { socket.off("typing", onTyping); socket.off("stop-typing", onStopTyping); setTypingUserId(null); };
  }, [socket, selectedUser._id, setTypingUserId]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader onAudioCall={() => call.begin("audio")} onVideoCall={() => call.begin("video")} />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader onAudioCall={() => call.begin("audio")} onVideoCall={() => call.begin("video")} />

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1 flex items-center gap-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex max-w-[min(78vw,34rem)] flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[260px] rounded-md mb-2 cursor-zoom-in transition hover:opacity-90"
                  onClick={() => setFullImage(message.image)}
                />
              )}
              {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}
              {message.senderId === authUser._id && <span className="mt-1 self-end text-base-content/55" title={message.readAt ? "Read" : "Sent"}>{message.readAt ? <CheckCheck className="size-3.5 text-info" /> : <Check className="size-3.5" />}</span>}
            </div>
          </div>
        ))}
      </div>

      {typingUserId === String(selectedUser._id) && <div className="px-6 pb-1 text-sm text-base-content/60"><span className="loading loading-dots loading-xs mr-1" />{selectedUser.username} is typing…</div>}

      <MessageInput />
      {fullImage && <div className="fixed inset-0 z-[60] grid place-items-center bg-black/90 p-4" role="dialog" aria-modal="true" onClick={() => setFullImage(null)}><button className="btn btn-circle btn-ghost absolute right-5 top-5 text-white" onClick={() => setFullImage(null)} aria-label="Close image"><X /></button><img src={fullImage} alt="Full-screen attachment" className="max-h-full max-w-full rounded-lg object-contain" onClick={(event) => event.stopPropagation()} /></div>}
    </div>
  );
};
export default ChatContainer;
