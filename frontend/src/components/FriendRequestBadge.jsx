import { useEffect, useState } from "react";
import { useFriendRequestStore } from "../store/useFriendRequestStore";
import { Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";

export default function FriendRequestBadge() {
  const { friendRequests, fetchFriendRequests } = useFriendRequestStore();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchFriendRequests();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFriendRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchFriendRequests]);

  const pendingCount = friendRequests.length;

  return (
    <Link
      to="/invite"
      className="relative p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title="Friend Requests"
    >
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        {pendingCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-500 rounded-full">
            {pendingCount > 9 ? "9+" : pendingCount}
          </span>
        )}
      </div>
    </Link>
  );
}
