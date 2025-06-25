import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Filter users by search query
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate online and offline users
  const onlineUsersList = filteredUsers.filter((user) => onlineUsers.includes(user._id));
  const offlineUsersList = filteredUsers.filter((user) => !onlineUsers.includes(user._id));

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>
        {/* Search input */}
        <div className="mt-3 hidden lg:block">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered input-sm w-full"
          />
        </div>
        {/* Online user count */}
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <span className="text-sm font-semibold">Online Users ({onlineUsersList.length})</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Online users */}
        {onlineUsersList.length > 0 && (
          <>
            {onlineUsersList.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className={
                  "w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors " +
                  (selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : "")
                }
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  <span
                    className="absolute bottom-0 right-0 size-3 bg-green-500 
                    rounded-full ring-2 ring-zinc-900"
                  />
                </div>

                {/* User info - only visible on larger screens */}
                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.username}</div>
                  <div className="text-sm text-zinc-400">Online</div>
                </div>
              </button>
            ))}
            <hr className="my-2 border-base-300" />
          </>
        )}

        {/* Offline users */}
        {offlineUsersList.length > 0 ? (
          offlineUsersList.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={
                "w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors " +
                (selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : "")
              }
            >
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.name}
                  className="size-12 object-cover rounded-full"
                />
              </div>

              {/* User info - only visible on larger screens */}
              <div className="hidden lg:block text-left min-w-0">
                <div className="font-medium truncate">{user.username}</div>
                <div className="text-sm text-zinc-400">Offline</div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">No users found</div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
