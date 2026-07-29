import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Search, X } from "lucide-react";

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    isChatSearchOpen,
    chatSearchQuery,
    setChatSearchQuery,
    closeChatSearch,
  } = useChatStore();

  const { onlineUsers, socket } = useAuthStore();
  const searchInputRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (isChatSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isChatSearchOpen]);

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const onlineUsersList = filteredUsers.filter((user) =>
    onlineUsers.includes(String(user._id))
  );
  const offlineUsersList = filteredUsers.filter(
    (user) => !onlineUsers.includes(String(user._id))
  );

  if (isUsersLoading) return <SidebarSkeleton />;

  const renderUser = (user, isOnline) => (
    <button
      key={user._id}
      onClick={() => setSelectedUser(user)}
      className={
        "w-full flex items-center gap-3 px-4 py-3 hover:bg-base-200 transition-colors text-left " +
        (selectedUser?._id === user._id ? "bg-base-200" : "")
      }
    >
      <div className="relative shrink-0">
        <img
          src={user.profilePic || "/avatar.png"}
          alt={user.name}
          className="size-12 rounded-full object-cover"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full bg-green-500 ring-2 ring-base-100" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{user.username}</p>
          <p className={`truncate text-sm ${isOnline ? "text-success" : "text-base-content/50"}`}>
            {isOnline ? "Online" : "Tap to chat"}
          </p>
        </div>
        {user.unreadCount > 0 && (
          <span className="badge badge-primary badge-sm shrink-0">
            {user.unreadCount > 99 ? "99+" : user.unreadCount}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <aside className="flex h-full w-full flex-col lg:w-80">
      <div className="shrink-0 border-b border-base-300 bg-base-100 px-4 pb-3 pt-3 lg:py-3">
        <div className={`${isChatSearchOpen ? "block" : "hidden"} lg:block`}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-base-content/50" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or start new chat"
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="input input-bordered h-10 w-full rounded-lg pl-10 pr-10 text-sm"
            />
            <button
              type="button"
              onClick={closeChatSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle lg:hidden"
              aria-label="Close search"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <p className={`text-xs text-base-content/60 ${isChatSearchOpen ? "mt-2" : "mt-0 lg:mt-2"}`}>
          {onlineUsersList.length} online
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {onlineUsersList.map((user) => renderUser(user, true))}
        {offlineUsersList.map((user) => renderUser(user, false))}

        {filteredUsers.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-base-content/50">
            {chatSearchQuery
              ? "No chats found."
              : "No chats yet. Invite friends to start messaging."}
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
