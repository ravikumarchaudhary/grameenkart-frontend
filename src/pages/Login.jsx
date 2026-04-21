import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { LanguageContext } from "../context/LanguageContext";
import { translations } from "../translations";
import logo from "../assets/logo.png";
import API from "../api/axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { language, setLanguage } = useContext(LanguageContext);
  const t = translations[language] || translations["en"];

const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await API.post("/login", {
      email,
      password,
    });

    console.log(res.data);
    // save token
    localStorage.setItem("token", res.data.token);
    alert("Login successful");

    // redirect
    window.location.href = "/dashboard";
  } catch (error) {
    console.error(error);
    alert(error.response?.data || "Login failed");
  }
};

  return (
    <div className={`login-container ${language}`}>
      <div className="login-card">
        <div className="login-left">
          <img src={logo} alt="GrameenKart Logo" className="logo" />
          <h1>{t.title}</h1>
          <p>{t.description}</p>
        </div>

        <div className="login-right">

          <select className="language-dropdown" value={language} onChange={(e) => setLanguage(e.target.value)}><option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>

          <h4>{t.login}</h4>
          <input type="email" placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)}/>
          <input type="password" placeholder={t.password} value={password} onChange={(e) => setPassword(e.target.value)}/>
          <button onClick={handleLogin}>{t.login}</button>
          <p className="signup-text">{t.signupText}{" "}<Link to="/signup" className="signup-link">{t.signup}</Link></p>
          <p className="forgot-password"><Link to="/forgot-password">{t.forgotPassword}</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Login;