import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useFriendRequestStore = create((set, get) => ({
  searchResults: [],
  searchQuery: "",
  hasSearched: false,
  friendRequests: [],
  sentRequests: [],
  isSearching: false,
  isSendingRequest: false,
  isLoading: false,
  isRespondingToRequest: false,

  searchUsers: async (query) => {
    if (!query?.trim()) {
      set({ searchResults: [], searchQuery: "", hasSearched: false });
      return;
    }

    const normalizedQuery = query.trim();
    set({ isSearching: true, searchQuery: normalizedQuery, hasSearched: true });
    try {
      let res;
      try {
        res = await axiosInstance.get("/users/search", {
          params: { query: normalizedQuery },
        });
      } catch {
        // Fallback for alternate backend route shape.
        res = await axiosInstance.get("/search/users", {
          params: { query: normalizedQuery },
        });
      }

      const authUser = useAuthStore.getState().authUser;
      const users = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
          ? res.data.users
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

      const normalized = users
        .filter((user) => user._id !== authUser?._id)
        .map((user) => ({
          ...user,
          username: user.username || "Unknown User",
          profilePic: user.profile_Pic || user.profilePic || "",
        }));

      set({ searchResults: normalized });
    } catch (error) {
      if (error?.response?.status === 404) {
        set({ searchResults: [] });
        return;
      }

      toast.error(error?.response?.data?.message || "Failed to search users");
    } finally {
      set({ isSearching: false });
    }
  },

  clearSearch: () => set({ searchResults: [], searchQuery: "", hasSearched: false }),

  fetchFriendRequests: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get("/users/friend-requests");
      set({ friendRequests: res.data?.friendRequests || [] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch friend requests"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSentRequests: async () => {
    try {
      const res = await axiosInstance.get("/users/sent-friend-requests");
      set({ sentRequests: res.data?.sentRequests || [] });
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch sent requests"
      );
    }
  },

  sendFriendRequest: async (receiverId) => {
    if (!receiverId) return;

    set({ isSendingRequest: true });
    try {
      const res = await axiosInstance.post("/users/friend-request", { receiverId });
      toast.success(res.data?.message || "Friend request sent");

      await get().fetchSentRequests();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send request");
      return false;
    } finally {
      set({ isSendingRequest: false });
    }
  },

  acceptFriendRequest: async (senderId) => {
    if (!senderId) return;

    set({ isRespondingToRequest: true });
    try {
      const res = await axiosInstance.post(
        `/users/${senderId}/accept-friend-request`,
        {
          senderId,
          action: "accept",
        }
      );

      toast.success(res.data?.message || "Friend request accepted");
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (request) => request?.senderId?._id !== senderId
        ),
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to accept request");
    } finally {
      set({ isRespondingToRequest: false });
    }
  },

  rejectFriendRequest: async (senderId) => {
    if (!senderId) return;

    set({ isRespondingToRequest: true });
    try {
      const res = await axiosInstance.post(
        `/users/${senderId}/reject-friend-request`,
        {
          senderId,
          action: "reject",
        }
      );

      toast.success(res.data?.message || "Friend request rejected");
      set((state) => ({
        friendRequests: state.friendRequests.filter(
          (request) => request?.senderId?._id !== senderId
        ),
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to reject request");
    } finally {
      set({ isRespondingToRequest: false });
    }
  },

  cancelSentFriendRequest: async (receiverId) => {
    if (!receiverId) return;

    try {
      const res = await axiosInstance.delete(
        `/users/${receiverId}/delete-friend-request`,
        {
          data: { receiverId },
        }
      );
      toast.success(res.data?.message || "Friend request cancelled");

      set((state) => ({
        sentRequests: state.sentRequests.filter(
          (request) => request?.receiverId?._id !== receiverId
        ),
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to cancel friend request"
      );
    }
  },
}));
