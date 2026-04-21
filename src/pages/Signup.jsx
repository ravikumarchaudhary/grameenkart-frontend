import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../translations";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Signup() {
  const navigate = useNavigate();

  const { language, setLanguage } = useContext(LanguageContext);
  const t = translations[language] || translations["en"];

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "",
  });

  // ✅ NEW STATES (OTP)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🚀 SEND OTP
  // Send OTP won't work wihtout enabling 2FA and apppassword(https://myaccount.google.com/apppasswords)
  // Whatever app password you will generate that you have to add in .env file 
    const handleSendOtp = async () => {
    if (!form.email) {
        setMessage("Please enter email first");
        return;
    }

    try {
        setLoading(true);
        setMessage("");

        const res = await API.post("/send-otp", {
        email: form.email,
        });

        setOtp(["", "", "", "", "", ""]);   // 🔥 ADD THIS
        setIsOtpSent(true);
        setShowOtpModal(true);

    } catch (error) {
        setMessage(error.response?.data || "Failed to send OTP");
    } finally {
        setLoading(false);
    }
    };

  // 🚀 VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
        setMessage("Enter OTP");
        return;
    }

    try {
        setLoading(true);

        const res = await API.post("/verify-otp", {
        email: form.email,
        otp: otp,
        });

        setIsOtpVerified(true);
        setShowOtpModal(false); // 🔥 CLOSE MODAL
        setMessage("OTP Verified ✅");

    } catch (error) {
        setMessage("Invalid OTP");
    } finally {
        setLoading(false);
    }
   };

  // 🚀 SIGNUP (UPDATED)
  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!form.userType) {
      alert("Please select user type");
      return;
    }

    // ❗ OTP CHECK
    if (!isOtpVerified) {
      alert("Please verify OTP before signup");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        userType: form.userType,
      });

      setMessage(res.data.message || "Signup successful");

      navigate("/");

    } catch (error) {
      console.error(error);
      alert(error.response?.data || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");

    if (!value) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
    }

    // Auto verify when filled
    if (newOtp.join("").length === 6) {
        verifyOtpAuto(newOtp.join(""));
    }
  };

  const verifyOtpAuto = async (finalOtp) => {
    try {
        setLoading(true);

        const res = await API.post("/verify-otp", {
        email: form.email,
        otp: finalOtp,
        });

        setIsOtpVerified(true);
        setShowOtpModal(false);
        setMessage("OTP Verified ✅");

    } catch (error) {
        setMessage("Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className={`login-container ${language}`}>
      <div className="login-card">

        {/* LEFT */}
        <div className="login-left">
          <img src={logo} alt="GrameenKart Logo" className="logo" />
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>

        {/* RIGHT */}
        <div className="login-right">

          {/* Language */}
          <select
            className="language-dropdown"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>

          <h4>{t.createAccount}</h4>

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder={t.name}
            value={form.name}
            onChange={handleChange}
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder={t.email}
            value={form.email}
            onChange={handleChange}
          />

          {message && <p className="message">{message}</p>}

          <button type="button" onClick={handleSendOtp} disabled={loading} style={{ marginBottom: "10px", background: "#1976d2" }}>
          {loading ? "Sending..." : "Send OTP"}
          </button>

          {/* OTP INPUT */}
          {showOtpModal && (
            <div className="otp-modal">
                <div className="otp-card">
                    <span className="otp-close" onClick={() => {
                        setShowOtpModal(false);
                        setOtp(["", "", "", "", "", ""]); // reset
                       }}>×
                    </span>
                <h3>Enter OTP</h3>
                <div className="otp-wrapper">
                <div className="otp-input-container">
                    {[...Array(6)].map((_, index) => (
                    <input
                        id={`otp-${index}`}
                        key={index}
                        type="text"
                        maxLength="1"
                        className="otp-box"
                        value={otp[index] || ""}
                        onChange={(e) => handleOtpChange(e, index)}
                    />
                    ))}
                </div>
                </div>
                </div>
            </div>
           )}

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder={t.password}
            value={form.password}
            onChange={handleChange}
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder={t.confirmPassword}
            value={form.confirmPassword}
            onChange={handleChange}
          />

          {/* User Type */}
          <select
            name="userType"
            value={form.userType}
            onChange={handleChange}
            className="input-select"
          >
            <option value="">{t.usertype}</option>
            <option value="customer">{t.customer}</option>
            <option value="shopkeeper">{t.shopkeeper}</option>
          </select>

          {/* SIGNUP */}
          <button type="button" onClick={handleSignup} disabled={loading}>
            {loading ? "Processing..." : t.createAccount}
          </button>

          {/* Login */}
          <p className="signup-text">
            {t.alreadyAccount}{" "}
            <Link to="/" style={{ color: "#2e7d32", fontWeight: "bold" }}>
              {t.login}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Signup;