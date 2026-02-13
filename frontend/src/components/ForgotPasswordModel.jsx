import React, { useState, useEffect } from "react";
import { X, Mail, Lock, Loader2, KeyRound, ArrowLeft,Eye, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { 
    forgotPassword, 
    verifyResetOTP, 
    resetPassword,
    isSendingOTP, 
    isVerifyingOTP, 
    isResettingPassword 
  } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  const resetForm = () => {
    setStep(1);
    setEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setTimeLeft(60);
    setCanResend(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateEmail = () => {
    if (!email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Invalid email");
    return true;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!validateEmail()) return;

    try {
      await forgotPassword(email);
      setStep(2);
      setTimeLeft(60);
      setCanResend(false);
    } catch (error) {
      console.error("Send OTP error:", error);
    }
  };

  const handleResendOTP = async () => {
    try {
      await forgotPassword(email);
      setTimeLeft(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    try {
      await verifyResetOTP({ email, otp: otpString });
      setStep(3);
    } catch (error) {
      console.error("Verify OTP error:", error);
    }
  };

  const validatePassword = () => {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      await resetPassword({ email, newPassword });
      handleClose();
    } catch (error) {
      console.error("Reset password error:", error);
    }
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-all duration-200"
        onClick={handleClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isSendingOTP || isVerifyingOTP || isResettingPassword}
          >
            <X className="size-4" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Back button for steps 2 & 3 */}
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="absolute left-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                disabled={isSendingOTP || isVerifyingOTP || isResettingPassword}
              >
                <ArrowLeft className="size-4" />
              </button>
            )}

            {/* Icon */}
            <div className="mx-auto w-12 h-12 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                {step === 1 && <Mail className="size-6 text-primary" />}
                {step === 2 && <KeyRound className="size-6 text-primary" />}
                {step === 3 && <Lock className="size-6 text-primary" />}
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {step === 1 && "Forgot Password"}
                {step === 2 && "Verify OTP"}
                {step === 3 && "Set New Password"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {step === 1 && "Enter your email to receive verification code"}
                {step === 2 && `We sent code to ${email}`}
                {step === 3 && "Choose a strong password for your account"}
              </p>
            </div>

            {/* Step 1: Email Form */}
            {step === 1 && (
              <form onSubmit={handleSendOTP}>
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="size-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isSendingOTP}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingOTP}
                >
                  {isSendingOTP ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Form */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP}>
                <div className="mb-4">
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={digit}
                        onChange={(e) => handleOTPChange(index, e.target.value)}
                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                        className={`w-10 h-10 text-center text-lg font-semibold 
                          border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary
                          transition-all outline-none
                          ${digit 
                            ? 'border-primary bg-primary/5 text-primary' 
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                          }
                          ${isVerifyingOTP ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isVerifyingOTP}
                        maxLength={1}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer & Resend */}
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 mb-4">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Code expires in {formatTime(timeLeft)}
                  </span>
                  
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                      disabled={isVerifyingOTP}
                    >
                      Resend
                    </button>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Resend in {formatTime(timeLeft)}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full px-3 py-2 text-sm font-medium text-white rounded-lg transition-colors
                    ${isOtpComplete && !isVerifyingOTP
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-primary/50 cursor-not-allowed'
                    }`}
                  disabled={!isOtpComplete || isVerifyingOTP}
                >
                  {isVerifyingOTP ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify OTP'
                  )}
                </button>
              </form>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
              <form onSubmit={handleResetPassword}>
                <div className="space-y-3 mb-4">
                  {/* New Password */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-4 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isResettingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4 text-gray-400" />
                      ) : (
                        <Eye className="size-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="size-4 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isResettingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4 text-gray-400" />
                      ) : (
                        <Eye className="size-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Password requirements */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Password must:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`size-3 ${newPassword.length >= 6 ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs text-gray-500">Be at least 6 characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className={`size-3 ${newPassword && newPassword === confirmPassword ? 'text-green-500' : 'text-gray-300'}`} />
                        <span className="text-xs text-gray-500">Passwords must match</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isResettingPassword || !newPassword || !confirmPassword}
                >
                  {isResettingPassword ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.15s ease-out, zoom-in-95 0.15s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ForgotPasswordModal;