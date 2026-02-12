import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isVerifyingOTP: false,
  isResendingOTP: false,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      // Don't set authUser yet - wait for OTP verification
      // The backend should return success message without setting user as authenticated
      toast.success("Verification code sent to your email");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  // Verify OTP method
  verifyOTP: async ({ email, otp }) => {
    set({ isVerifyingOTP: true });
    try {
      const res = await axiosInstance.post("/auth/verify-otp", { email, otp });
      
      // After successful OTP verification, set the auth user
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

  // Resend OTP method
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
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },
  
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));