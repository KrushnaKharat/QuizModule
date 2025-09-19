import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "../pages/NotificationBell";

function Navbar({ userName, userId, token }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <img src="/pictures/logo.png" alt="Logo" className="h-10 w-10" />
        <span className="text-xl font-bold text-indigo-700">Applied InSights</span>
      </div>

      {/* Center Buttons */}
      <div className="flex gap-4">
        <button
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-indigo-700 transition"
          onClick={() => navigate("/quizgame")}
        >
          Host Quiz
        </button>
        <button
          className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-200 transition"
          onClick={() => window.open("https://appliedinsights.in/", "_blank")}
        >
          Visit Website
        </button>
      </div>

      {/* Right Side: Notification & User */}
      <div className="flex items-center gap-4 relative">
        <NotificationBell userId={userId} token={token} />
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition font-semibold text-indigo-700"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            {userName && `Hi, ${userName}`}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
              <button
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                onClick={() => {
                  setShowDropdown(false);
                  localStorage.clear();
                  window.location.href = "/";
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;