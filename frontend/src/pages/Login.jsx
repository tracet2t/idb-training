// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const res = await API.post('/auth/login', form);
    navigate("/dashboard");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F0F4F8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "0.5px solid #D8E4EF",
          borderRadius: 16,
          padding: "2.5rem 2rem",
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 2px 24px rgba(26,58,107,0.08)",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "#EBF3FC",
              border: "0.5px solid #C2D8EF",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A6FC4"
              strokeWidth="1.8"
              width="26"
              height="26"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p
            style={{
              color: "#1A3A6B",
              fontSize: 18,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Industry Development Board
          </p>
          <p style={{ color: "#5A7FA8", fontSize: 13, marginTop: 4 }}>
            Training & Development Platform
          </p>
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#1A3A6B",
            textAlign: "center",
            fontWeight: 500,
            fontSize: 22,
            marginBottom: 6,
          }}
        >
          Welcome back
        </h2>
        <p
          style={{
            color: "#5A7FA8",
            textAlign: "center",
            fontSize: 14,
            marginBottom: "2rem",
          }}
        >
          Sign in to your account to continue
        </p>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                color: "#4A6FA5",
                fontSize: 13,
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Email address
            </label>
            <div style={{ position: "relative" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A8C0D8"
                strokeWidth="1.8"
                width="16"
                height="16"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder="yourname@idb.gov.lk"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: "100%",
                  background: "#F7FAFE",
                  border: "0.5px solid #C8DAEA",
                  borderRadius: 8,
                  padding: "11px 12px 11px 38px",
                  fontSize: 14,
                  color: "#1A3A6B",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                color: "#4A6FA5",
                fontSize: 13,
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <div style={{ position: "relative" }}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A8C0D8"
                strokeWidth="1.8"
                width="16"
                height="16"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{
                  width: "100%",
                  background: "#F7FAFE",
                  border: "0.5px solid #C8DAEA",
                  borderRadius: 8,
                  padding: "11px 40px 11px 38px",
                  fontSize: 14,
                  color: "#1A3A6B",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "#A8C0D8",
                }}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="16"
                    height="16"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    width="16"
                    height="16"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <a
                href="#"
                style={{
                  fontSize: 12,
                  color: "#1A6FC4",
                  textDecoration: "none",
                }}
              >
                Forgot password?
              </a>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            style={{
              width: "100%",
              background: "#1A3A6B",
              border: "none",
              borderRadius: 8,
              padding: 12,
              fontSize: 15,
              fontWeight: 500,
              color: "#FFFFFF",
              cursor: "pointer",
              letterSpacing: "0.3px",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1A52A0")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#1A3A6B")}
          >
            Sign in
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "1.5rem 0 0",
          }}
        >
          <div style={{ flex: 1, height: "0.5px", background: "#E8EFF6" }} />
          <span
            style={{ fontSize: 11, color: "#B0C4D8", letterSpacing: "0.4px" }}
          >
            secure government access
          </span>
          <div style={{ flex: 1, height: "0.5px", background: "#E8EFF6" }} />
        </div>

        {/* Help */}
        <p
          style={{
            marginTop: "1.25rem",
            textAlign: "center",
            fontSize: 12,
            color: "#A8BDD0",
          }}
        >
          Having trouble?{" "}
          <a href="#" style={{ color: "#1A6FC4", textDecoration: "none" }}>
            Contact IDB IT Support
          </a>
        </p>
      </div>
    </div>
  );
}
