import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  typingUserId: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isChatSearchOpen: false,
  chatSearchQuery: "",

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/friends-list");
      const mappedUsers = (res.data?.friends || []).map((user) => {
        const username =
          user.username ||
          user.name ||
          "Unknown User";

        return {
          ...user,
          username,
          profilePic: user.profilePic || user.profile_Pic || "",
        };
      });

      set({ users: mappedUsers });

      const { selectedUser } = get();
      if (selectedUser && !mappedUsers.some((user) => user._id === selectedUser._id)) {
        set({ selectedUser: null });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load friends list");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set((state) => ({ messages: res.data, users: state.users.map((user) => user._id === userId ? { ...user, unreadCount: 0 } : user) }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser;
      const senderId = String(newMessage.senderId);
      const isOpenConversation = String(selectedUser?._id) === senderId;
      set((state) => ({
        messages: isOpenConversation ? [...state.messages, newMessage] : state.messages,
        users: state.users.map((user) => user._id === senderId ? { ...user, unreadCount: isOpenConversation ? 0 : (user.unreadCount || 0) + 1 } : user),
      }));
      if (isOpenConversation) axiosInstance.post(`/messages/${senderId}/read`).catch(() => {});
    });

    socket.off("messages-read");
    socket.on("messages-read", ({ messageIds, readAt }) => {
      const ids = new Set(messageIds);
      set((state) => ({ messages: state.messages.map((message) => ids.has(String(message._id)) ? { ...message, readAt } : message) }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket?.off("newMessage");
    socket?.off("messages-read");
  },

  setSelectedUser: (selectedUser) =>
    set({ selectedUser, isChatSearchOpen: false, chatSearchQuery: "" }),
  setTypingUserId: (typingUserId) => set({ typingUserId }),
  setChatSearchOpen: (isChatSearchOpen) => set({ isChatSearchOpen }),
  setChatSearchQuery: (chatSearchQuery) => set({ chatSearchQuery }),
  closeChatSearch: () => set({ isChatSearchOpen: false, chatSearchQuery: "" }),
}));
