import { useEffect } from "react";
import { useFriendRequestStore } from "../store/useFriendRequestStore";
import { Check, Loader, X } from "lucide-react";

export default function FriendRequestsList() {
  const {
    friendRequests,
    isLoading,
    isRespondingToRequest,
    fetchFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useFriendRequestStore();

  useEffect(() => {
    fetchFriendRequests();
  }, [fetchFriendRequests]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (friendRequests.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
        <p>No friend requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Friend Requests ({friendRequests.length})
      </h3>
      <div className="space-y-3">
        {friendRequests.map((request) => (
          <div
            key={request._id}
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-base-300 bg-base-100"
          >
            <div className="flex items-center gap-3 flex-1">
              {request.senderId?.profile_Pic ? (
                <img
                  src={request.senderId.profile_Pic}
                  alt={request.senderId.username || request.senderId.name}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                  {(request.senderId?.username || request.senderId?.name || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">
                  {request.senderId?.username || request.senderId?.name}
                </h4>
              </div>
            </div>

            <div className="ml-4 flex gap-2">
              <button
                onClick={() => acceptFriendRequest(request.senderId._id)}
                disabled={isRespondingToRequest}
                className="btn btn-sm btn-success"
              >
                {isRespondingToRequest ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    Accept
                  </span>
                )}
              </button>
              <button
                onClick={() => rejectFriendRequest(request.senderId._id)}
                disabled={isRespondingToRequest}
                className="btn btn-sm btn-error"
              >
                {isRespondingToRequest ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-1.5">
                    <X className="h-4 w-4" />
                    Reject
                  </span>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
