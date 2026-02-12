import { User, Mail, Lock, Eye, EyeOff, Loader2, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // FIXED: Added useNavigate
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import OTPModal from "../components/OTPModal"; // FIXED: Import the OTP modal
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false); // NEW: State for OTP modal visibility
  const [pendingEmail, setPendingEmail] = useState(""); // NEW: Store email for OTP verification
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate(); // NEW: For navigation after verification
  const { signup, isSigningUp } = useAuthStore(); // FIXED: Removed unused verifyOTP, resendOTP from here

  // FIXED: Improved validation with trim() and better error messages
  const validateForm = () => {
    if (formData.username.trim() === "") return toast.error("Username is required");
    if (formData.email.trim() === "") return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");
    return true;
  };

  // FIXED: Complete overhaul of handleSubmit to work with OTP flow
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const success = validateForm();
    if (success === true) {
      try {
        // Step 1: Signup - this sends OTP to email
        await signup(formData);
        
        // Step 2: Store email and show OTP modal for verification
        setPendingEmail(formData.email);
        setShowOTPModal(true);
        
        // FIXED: Removed duplicate toast - signup already shows toast
      } catch (error) {
        // Error is already handled in the store
        console.error("Signup error:", error);
      }
    }
  };

  // NEW: Callback for successful OTP verification
  const handleOTPVerified = () => {
    setShowOTPModal(false); // Close the modal
    navigate("/"); // Redirect to home/dashboard
    toast.success("Welcome! Your account has been verified. Now please log in."); // Welcome message
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="size-12 rounded-xl bg-primary/10 flex items-center justify-center 
              group-hover:bg-primary/20 transition-colors"
              >
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className="input input-bordered w-full pl-10"
                  placeholder="John Doe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isSigningUp} // FIXED: Disable during signup
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isSigningUp} // FIXED: Disable during signup
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  disabled={isSigningUp} // FIXED: Disable during signup
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSigningUp} // FIXED: Disable during signup
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* FIXED: Fixed typo in subtitle - changed "shere" to "share" */}
      <AuthImagePattern
        title="Join Our community"
        subtitle="Connect with friends, share moments, and stay in touch with your loved ones."
      />
      
      {/* NEW: OTP Modal component - now handles verification internally */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={pendingEmail}
        onVerify={handleOTPVerified}
        // FIXED: Removed onResend and isVerifying props - modal now uses store directly
      />
    </div>
  );
};

export default SignUpPage;