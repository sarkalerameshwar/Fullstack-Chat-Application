import { Loader, Search, UserPlus, Clock3 } from "lucide-react";
import { useFriendRequestStore } from "../store/useFriendRequestStore";

export default function SearchResults() {
  const {
    searchResults,
    searchQuery,
    hasSearched,
    sentRequests,
    isSearching,
    isSendingRequest,
    sendFriendRequest,
    cancelSentFriendRequest,
  } = useFriendRequestStore();

  if (isSearching) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (searchResults.length === 0 && !hasSearched) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
        <Search className="h-8 w-8 mx-auto mb-2 opacity-70" />
        <p>Search for users by username or email to send friend requests.</p>
      </div>
    );
  }

  if (searchResults.length === 0 && hasSearched) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/70">
        <Search className="h-8 w-8 mx-auto mb-2 opacity-70" />
        <p>No users found for "{searchQuery}".</p>
      </div>
    );
  }

  const pendingReceiverIds = new Set(
    sentRequests
      .map((request) => request?.receiverId?._id)
      .filter(Boolean)
  );

  return (
    <div className="space-y-3">
      {searchResults.map((user) => {
        const isPending = pendingReceiverIds.has(user._id);

        return (
          <div
            key={user._id}
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-base-300 bg-base-100"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {user.profilePic ? (
                <img
                  src={user.profilePic}
                  alt={user.username}
                  className="size-12 rounded-full object-cover"
                />
              ) : (
                <div className="size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
                  {(user.username || "U").charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h4 className="font-semibold truncate">{user.username}</h4>
                <p className="text-sm text-base-content/70 truncate">{user.email}</p>
              </div>
            </div>

            {isPending ? (
              <button
                onClick={() => cancelSentFriendRequest(user._id)}
                className="btn btn-sm btn-outline"
              >
                <Clock3 className="h-4 w-4" />
                Pending
              </button>
            ) : (
              <button
                onClick={() => sendFriendRequest(user._id)}
                disabled={isSendingRequest}
                className="btn btn-sm btn-primary"
              >
                {isSendingRequest ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add Friend
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
