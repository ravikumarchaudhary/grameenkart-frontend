import { useState } from "react";
import { useParams } from "react-router-dom";
import "./Login.css";

function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");

  const handleReset = () => {
    console.log("Token:", token);
    console.log("New Password:", password);
    // API call later
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-right" style={{ width: "100%" }}>
          <h2>Reset Password</h2>

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleReset}>
            Reset Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;