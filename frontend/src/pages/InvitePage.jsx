import { useState, useRef, useEffect } from "react";
import { useFriendRequestStore } from "../store/useFriendRequestStore";
import SearchResults from "../components/SearchResults";
import { Search, X, Users } from "lucide-react";

export default function InvitePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchInputRef = useRef(null);
  const { searchUsers, clearSearch, fetchSentRequests } =
    useFriendRequestStore();

  useEffect(() => {
    fetchSentRequests();
  }, [fetchSentRequests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      clearSearch();
      return;
    }

    searchUsers(debouncedQuery);
  }, [debouncedQuery, searchUsers, clearSearch]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    clearSearch();
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="h-screen bg-base-200 pt-20">
      <div className="max-w-5xl mx-auto px-4 pb-6 h-[calc(100vh-5rem)]">
        <div className="bg-base-100 rounded-xl border border-base-300 shadow-lg h-full overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="px-6 py-5 border-b border-base-300 bg-base-100">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">
                    Find & Invite Friends
                  </h1>
                  <p className="text-sm text-base-content/70 mt-1">
                    Search by username or email and send friend requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-b border-base-300 bg-base-100">
              <label className="input input-bordered w-full flex items-center gap-2">
                <Search className="w-4 h-4 opacity-70" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by username or email..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="grow"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearSearch}
                    className="btn btn-ghost btn-xs"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <SearchResults />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
