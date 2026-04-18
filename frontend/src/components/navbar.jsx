import React, { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useFriendRequestStore } from "../store/useFriendRequestStore.js";
import { Link } from 'react-router-dom'
import { LogOut, MessageSquare, Settings, User, UserCheck, Users } from "lucide-react";


const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { friendRequests, fetchFriendRequests } = useFriendRequestStore();

  // Fetch friend requests when component mounts or authUser changes
  useEffect(() => {
    if (authUser) {
      fetchFriendRequests();
      // Refresh every 30 seconds
      const interval = setInterval(fetchFriendRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser, fetchFriendRequests]);
  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">ChattX</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={"/invite"}
              className={`
              btn btn-sm gap-2 transition-colors
              `}
              title="Send & Manage Friend Requests"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Invite</span>
            </Link>

            <Link
              to={"/accept"}
              className={`
              btn btn-sm gap-2 transition-colors relative
              `}
              title="Accept Friend Requests"
            >
              <div className="relative">
                <UserCheck className="w-4 h-4" />
                {friendRequests && friendRequests.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {friendRequests.length > 9 ? "9+" : friendRequests.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline">Accept</span>
            </Link>

            <Link
              to={"/settings"}
              className={`
              btn btn-sm gap-2 transition-colors
              
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            {authUser && (
              <>
                <Link to={"/profile"} className={`btn btn-sm gap-2`}>
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
