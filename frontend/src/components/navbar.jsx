import React, { createElement, useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { useFriendRequestStore } from "../store/useFriendRequestStore.js";
import { useChatStore } from "../store/useChatStore.js";
import { Link, useLocation } from "react-router-dom";
import {
  Clock3,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  User,
  UserCheck,
  Users,
} from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { friendRequests, fetchFriendRequests } = useFriendRequestStore();
  const { selectedUser, isChatSearchOpen, setChatSearchOpen, closeChatSearch } =
    useChatStore();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchFriendRequests();
      const interval = setInterval(fetchFriendRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser, fetchFriendRequests]);

  useEffect(() => {
    if (location.pathname !== "/") closeChatSearch();
  }, [location.pathname, closeChatSearch]);

  const hideOnMobileChat =
    isMobile && location.pathname === "/" && Boolean(selectedUser);

  if (hideOnMobileChat) return null;

  const pendingCount = friendRequests?.length ?? 0;

  const navLinks = authUser
    ? [
        { to: "/invite", icon: Users, label: "Invite" },
        {
          to: "/accept",
          icon: UserCheck,
          label: "Accept",
          badge: pendingCount,
        },
        { to: "/calls", icon: Clock3, label: "Calls" },
        { to: "/settings", icon: Settings, label: "Settings" },
        { to: "/profile", icon: User, label: "Profile" },
      ]
    : [{ to: "/settings", icon: Settings, label: "Settings" }];

  const showMobileSearch =
    authUser && isMobile && location.pathname === "/" && !selectedUser;

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="mx-auto h-16 max-w-[1500px] px-4">
        <div className="flex items-center justify-between h-full">
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-all"
          >
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">ChattX</h1>
          </Link>

          <div className="flex items-center gap-2">
            {showMobileSearch && !isChatSearchOpen && (
              <button
                type="button"
                className="btn btn-ghost btn-sm btn-circle"
                onClick={() => setChatSearchOpen(true)}
                aria-label="Open search"
              >
                <Search className="size-5" />
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2">
              {authUser && (
                <>
                  <Link
                    to="/invite"
                    className="btn btn-sm gap-2 transition-colors"
                    title="Send & Manage Friend Requests"
                  >
                    <Users className="w-4 h-4" />
                    <span>Invite</span>
                  </Link>

                  <Link
                    to="/accept"
                    className="btn btn-sm gap-2 transition-colors relative"
                    title="Accept Friend Requests"
                  >
                    <div className="relative">
                      <UserCheck className="w-4 h-4" />
                      {pendingCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {pendingCount > 9 ? "9+" : pendingCount}
                        </span>
                      )}
                    </div>
                    <span>Accept</span>
                  </Link>

                  <Link
                    to="/calls"
                    className="btn btn-sm gap-2 transition-colors"
                    title="Call history"
                  >
                    <Clock3 className="w-4 h-4" />
                    <span>Calls</span>
                  </Link>
                </>
              )}

              <Link to="/settings" className="btn btn-sm gap-2 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              {authUser && (
                <>
                  <Link to="/profile" className="btn btn-sm gap-2">
                    <User className="size-5" />
                    <span>Profile</span>
                  </Link>

                  <button
                    className="flex gap-2 items-center btn btn-sm btn-ghost"
                    onClick={logout}
                  >
                    <LogOut className="size-5" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>

            <div className="dropdown dropdown-end lg:hidden">
              <button
                tabIndex={0}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ul
                tabIndex={0}
                className="dropdown-content menu bg-base-100 rounded-box z-50 w-56 p-2 shadow-lg border border-base-300 mt-2"
              >
                {navLinks.map(({ to, icon, label, badge }) => (
                  <li key={to}>
                    <Link to={to} className="flex items-center gap-3">
                      {createElement(icon, { className: "w-4 h-4" })}
                      <span>{label}</span>
                      {badge > 0 && (
                        <span className="badge badge-primary badge-sm ml-auto">
                          {badge > 9 ? "9+" : badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
                {authUser && (
                  <li>
                    <button onClick={logout} className="flex items-center gap-3">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
