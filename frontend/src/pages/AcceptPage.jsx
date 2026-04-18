import { useEffect } from "react";
import { useFriendRequestStore } from "../store/useFriendRequestStore";
import FriendRequestsList from "../components/FriendRequestsList";
import { UserCheck } from "lucide-react";


export default function AcceptPage() {
    const { fetchFriendRequests } = useFriendRequestStore();

    useEffect(() => {
        fetchFriendRequests();
    }, [fetchFriendRequests]);

    return (
        <div className="h-screen bg-base-200 pt-20">
          <div className="max-w-5xl mx-auto px-4 pb-6 h-[calc(100vh-5rem)]">
            <div className="bg-base-100 rounded-xl border border-base-300 shadow-lg h-full overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="px-6 py-5 border-b border-base-300 bg-base-100">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold">
                        Accept Friend Requests
                      </h1>
                      <p className="text-sm text-base-content/70 mt-1">
                        Review incoming requests and accept or reject them.
                      </p>
                    </div>
                  </div>
                </div>
    
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <FriendRequestsList />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}