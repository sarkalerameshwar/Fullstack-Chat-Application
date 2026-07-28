import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isVerifyingOTP: false,
  isResendingOTP: false,
  isSendingOTP: false,
  isResettingPassword: false,
  onlineUsers: [],
  socket: null,
  socketConnected: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      if (error.response?.status !== 401) {
        console.log("Error in checkAuth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success("Verification code sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOTP: async ({ email, otp }) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });

      if (res.data.user) {
        set({ authUser: res.data.user });
        get().connectSocket();
        toast.success("Email verified successfully!");
      }

      return res.data;
    } catch (error) {
      console.log("Error in verifyOTP:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  resendOTP: async (email) => {
    set({ isResendingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/resend-otp", { email });
      toast.success("Verification code resent successfully");
      return res.data;
    } catch (error) {
      console.log("Error in resendOTP:", error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      throw error;
    } finally {
      set({ isResendingOTP: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  loginWithGoogle: async () => {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    if (!apiKey || apiKey.trim() === "" || apiKey.startsWith("AIzaSyDummy") || apiKey.includes("YOUR_FIREBASE_API_KEY")) {
      toast.error("Please replace YOUR_FIREBASE_API_KEY in frontend/.env with your real Firebase API Key.", { id: "firebase-key-missing", duration: 6000 });
      return;
    }

    set({ isLoggingIn: true });
    try {
      const { signInWithPopup } = await import("firebase/auth");
      const { auth, googleProvider } = await import("../lib/firebase.js");
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const payload = {
        email: user.email,
        name: user.displayName || user.email?.split("@")[0],
        picture: user.photoURL || "",
        uid: user.uid,
      };

      const res = await axiosInstance.post("/auth/google", payload);
      set({ authUser: res.data });
      toast.success("Signed in with Google successfully!");
      get().connectSocket();
    } catch (error) {
      console.log("Error in loginWithGoogle:", error);
      if (error.code === "auth/api-key-not-valid.-please-pass-a-valid-api-key.") {
        toast.error("Please add your valid Firebase API key in frontend/.env file");
      } else if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.response?.data?.message || error.message || "Google sign in failed");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },

  forgotPassword: async (email) => {
    set({ isSendingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/forgot-password", { email });
      toast.success(res.data.message || "OTP sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      throw error;
    } finally {
      set({ isSendingOTP: false });
    }
  },

  verifyResetOTP: async ({ email, otp }) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-reset-otp", {
        email,
        otp,
      });
      toast.success(res.data.message || "OTP verified successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    } finally {
      set({ isVerifyingOTP: false });
    }
  },

  resetPassword: async ({ email, newPassword }) => {
    set({ isResettingPassword: true });
    try {
      const res = await axiosInstance.post("/auth/reset-password", {
        email,
        newPassword,
      });
      toast.success(res.data.message || "Password reset successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    } finally {
      set({ isResettingPassword: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    set({ socket: socket });

    socket.on("connect", () => set({ socketConnected: true }));
    socket.on("disconnect", () => set({ socketConnected: false, onlineUsers: [] }));
    socket.on("connect_error", (error) => {
      console.error("Socket connection failed:", error.message);
      set({ socketConnected: false });
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds.map(String) });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) socket.disconnect();
    set({ socket: null, socketConnected: false, onlineUsers: [] });
  },
}));
