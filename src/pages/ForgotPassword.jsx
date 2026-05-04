import { useState } from "react";
import API from "../api/axios";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=reset
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 SEND OTP
  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Enter email");
      return;
    }

    try {
      setLoading(true);
      await API.post("/send-otp", { email, type: "resetpassword" });

      setStep(2);
      setOtp(["", "", "", "", "", ""]);
      setMessage("OTP sent");

    } catch (err) {
        setMessage("Failed to send OTP");
    } finally {
        setLoading(false);
    }
  };

const handleKeyDown = (e, index) => {
  if (e.key === "Backspace") {
    if (otp[index]) {
      // If current box has value → clear it ONLY
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
    } else if (index > 0) {
      // If already empty → go to previous
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  }

  if (e.key === "Enter") {
    const finalOtp = otp.join("");

    if (finalOtp.length === 6 && !loading) {
      verifyOtp(finalOtp);
    }
  }
};

  // 🔥 OTP INPUT
  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (newOtp.join("").length === 6 && !loading) {
      verifyOtp(newOtp.join(""));
    }
  };

  // 🔥 VERIFY OTP
  const verifyOtp = async (finalOtp) => {
    try {
      setLoading(true);

      await API.post("/verify-otp", {
        email,
        otp: finalOtp,
      });

      setStep(3);
      setMessage("OTP verified");

    } catch {
      setMessage("Invalid OTP");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 RESET PASSWORD
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setMessage("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await API.post("/reset-password", {
        email,
        newPassword,
      });

      setMessage("Password updated successfully");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);

    } catch {
      setMessage("Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-right" style={{ width: "100%" }}>

          <h2>Forgot Password</h2>
          {message && <p className="message">{message}</p>}

{step === 1 && (
  <form
    className="forgot-form"
    onSubmit={(e) => {
      e.preventDefault();
      handleSendOtp();
    }}
  >
    <input
      type="email"
      placeholder="Enter your email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      className="forgot-input"
    />

    <button
      type="submit"
      disabled={loading}
      className="forgot-btn"
    >
      {loading ? "Sending..." : "Send OTP"}
    </button>
  </form>
)}
 
          {step === 2 && (
            <div className="otp-input-container">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  className="otp-box"
                  maxLength="1"
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {/* 👁️ Show Password */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                <label htmlFor="showPassword" style={{ marginLeft: "8px", cursor: "pointer" }}>
                  Show Password
                </label>
              </div>

              <button onClick={handleResetPassword} disabled={loading}>
                {loading ? "Updating..." : "Reset Password"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;