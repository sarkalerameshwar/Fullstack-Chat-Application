import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Mail, KeyRound, Shield, Clock, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const OTPModal = ({ isOpen, onClose, email, onVerify }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  // const [isResendHovered, setIsResendHovered] = useState(false);
  const inputRefs = useRef([]);

  const { verifyOTP, resendOTP, isVerifyingOTP, isResendingOTP } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      // Focus first input when modal opens
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0 && isOpen) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, isOpen]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Please paste a valid numeric code");
      return;
    }

    const pastedArray = pastedData.split("");
    const newOtp = [...otp];
    
    pastedArray.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    const lastFilledIndex = Math.min(pastedArray.length - 1, 5);
    if (lastFilledIndex < 5) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter complete 6-digit OTP");
      return;
    }

    try {
      await verifyOTP({ email, otp: otpString });
      onVerify();
      onClose();
    } catch (error) {
      console.error("OTP verification failed:", error);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(email);
      setTimeLeft(120);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP failed:", error);
    }
  };

  if (!isOpen) return null;

  const isOtpComplete = otp.every(digit => digit !== "");

 return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-primary/20 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-sm transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-xl transition-all duration-200 animate-in fade-in zoom-in-95">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={isVerifyingOTP}
          >
            <X className="size-4" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto w-12 h-12 mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl">
                <Mail className="size-6 text-primary" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                Verify your email
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We sent code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
              </p>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className={`w-10 h-10 text-center text-lg font-semibold 
                        border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary
                        transition-all outline-none
                        ${digit 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white'
                        }
                        ${isVerifyingOTP ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isVerifyingOTP || isResendingOTP}
                      maxLength={1}
                    />
                  ))}
                </div>
              </div>

              {/* Timer & Resend */}
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5 text-gray-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                
                {!canResend ? (
                  <span className="text-xs text-gray-500">
                    Resend in {formatTime(timeLeft)}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                    disabled={isVerifyingOTP || isResendingOTP}
                  >
                    {isResendingOTP ? (
                      <span className="flex items-center gap-1">
                        <Loader2 className="size-3 animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      'Resend code'
                    )}
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  disabled={isVerifyingOTP || isResendingOTP}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-3 py-2 text-xs font-medium text-white rounded-lg transition-colors
                    ${isOtpComplete && !isVerifyingOTP
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-primary/50 cursor-not-allowed'
                    }`}
                  disabled={!isOtpComplete || isVerifyingOTP || isResendingOTP}
                >
                  {isVerifyingOTP ? (
                    <span className="flex items-center justify-center gap-1">
                      <Loader2 className="size-3 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>

            {/* Help Text */}
            <p className="text-center text-xs text-gray-400 mt-4">
              Didn't get it? Check spam
            </p>
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

export default OTPModal;