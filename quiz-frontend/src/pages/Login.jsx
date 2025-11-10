import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupMobile, setSignupMobile] = useState(""); // <-- add this
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateMobile = (mobile) => {
    return /^\d{10}$/.test(mobile);
  };

  // Autofill email after signup
  useEffect(() => {
    if (!isSignup) {
      const lastSignupEmail = localStorage.getItem("lastSignupEmail");
      if (lastSignupEmail) {
        setEmail(lastSignupEmail);
        localStorage.removeItem("lastSignupEmail");
      }
    }
  }, [isSignup]);

  const handleLogin = async () => {
    setErrorMsg("");

    try {
      const res = await axios.post(
        "https://quizmodule.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate(res.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      setErrorMsg("Invalid email or password");
    }
  };

  const handleSignup = async () => {
    setSignupError("");
    setSignupSuccess("");
    if (!validateEmail(signupEmail)) {
      setSignupError("Please enter a valid email address.");
      return;
    }
    if (!validateMobile(signupMobile)) {
      setSignupError("Mobile number must be exactly 10 digits.");
      return;
    }
    try {
      await axios.post("https://quizmodule.onrender.com/api/auth/register", {
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        mobile: signupMobile,
        role: "user",
        courses: [2, 15],
      });
      setSignupSuccess("🎉 Registration successful! You can now log in.");
      localStorage.setItem("lastSignupEmail", signupEmail);
      setIsSignup(false);
      setSignupName("");
      setSignupEmail("");
      setSignupMobile("");
      setSignupPassword("");
    } catch (err) {
      setSignupError(
        err.response?.data?.msg ||
          "Registration failed. Email may already be in use."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-blue-200 to-purple-200">
      <div className="relative w-full max-w-md">
        {/* Decorative Circles */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-gradient-to-br from-indigo-500 to-purple-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-gradient-to-br from-green-400 to-blue-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="relative z-10 bg-white shadow-2xl rounded-3xl px-10 py-12">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/pictures/logo.png"
              alt="Logo"
              className="h-16 w-16 mb-2 drop-shadow-lg"
            />
            <h1 className="text-3xl font-extrabold text-indigo-700 tracking-tight mb-1">
              Applied InSights
            </h1>
            <p className="text-indigo-400 font-medium text-sm">
              {isSignup ? "Create your account" : "Welcome back! Please login"}
            </p>
          </div>
          <h2 className="text-2xl font-bold text-center mb-8 text-indigo-700">
            {isSignup ? "Sign Up" : "Login"}
          </h2>
          {isSignup ? (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 transition"
              />
              <input
                type="email"
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 transition"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={signupMobile}
                onChange={(e) => setSignupMobile(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 transition"
                maxLength={15}
              />
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 pr-12 transition"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off SVG
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                    >
                      <path
                        d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  ) : (
                    // Eye SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#6366f1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 3-4 7-10 7S2 15 2 12s4-7 10-7 10 4 10 7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="mb-2 text-green-700 text-sm font-semibold flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Default Course:{" "}
                <span className="font-bold">Python + Internship Test</span>
              </div>
              {signupError && (
                <div className="text-red-600 text-sm mb-4">{signupError}</div>
              )}
              {signupSuccess && (
                <div className="text-green-600 text-sm mb-4">
                  {signupSuccess}
                </div>
              )}
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition mb-2"
                onClick={handleSignup}
              >
                Sign Up
              </button>
              <button
                className="w-full py-2 rounded-xl bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200 transition"
                onClick={() => setIsSignup(false)}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 transition"
                autoComplete="username"
              />
              <div className="relative mb-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-indigo-50 pr-12 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-indigo-400"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    // Eye-off SVG
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                    >
                      <path
                        d="M2.99902 3L20.999 21M9.8433 9.91364C9.32066 10.4536 8.99902 11.1892 8.99902 12C8.99902 13.6569 10.3422 15 11.999 15C12.8215 15 13.5667 14.669 14.1086 14.133M6.49902 6.64715C4.59972 7.90034 3.15305 9.78394 2.45703 12C3.73128 16.0571 7.52159 19 11.9992 19C13.9881 19 15.8414 18.4194 17.3988 17.4184M10.999 5.04939C11.328 5.01673 11.6617 5 11.9992 5C16.4769 5 20.2672 7.94291 21.5414 12C21.2607 12.894 20.8577 13.7338 20.3522 14.5"
                        stroke="#6366f1"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      ></path>
                    </svg>
                  ) : (
                    // Eye SVG
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="#6366f1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7 0c0 3-4 7-10 7S2 15 2 12s4-7 10-7 10 4 10 7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errorMsg && (
                <div className="text-red-600 text-sm mb-4">{errorMsg}</div>
              )}
              <button
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition mb-2"
                onClick={handleLogin}
              >
                Login
              </button>
              <button
                className="w-full py-2 rounded-xl bg-green-100 text-green-700 font-semibold hover:bg-green-200 transition"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </button>
              <div className="mt-6 text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Applied InSights. All rights
                reserved.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
