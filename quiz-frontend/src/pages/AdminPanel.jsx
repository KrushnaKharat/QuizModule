import React, { useEffect, useState } from "react";
import axios from "axios";
import Users from "./Users";
import Courses from "./Courses";

function AdminPanel() {
  const [showUsers, setShowUsers] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch logged-in user details from backend
    axios
      .get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUserName(res.data.name);
        setUserEmail(res.data.email);
      })
      .catch(() => {
        setUserName("Admin");
        setUserEmail("");
      });
  }, [token]);

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">
      <div className="w-1/5 bg-gray-500 flex flex-col p-4 gap-12 text-white align-middle text-lg">
        <div className="text-center">
          <h2>Hii.. {userName}</h2>
          <p className="text-sm mt-2">{userEmail}</p>
        </div>
        <div className="flex flex-col text-center">
          <a href="#" className="p-4" onClick={() => setShowUsers(false)}>
            Home
          </a>
          <a href="#" className="p-4" onClick={() => setShowUsers(false)}>
            Courses
          </a>
          <a href="#" className="p-4" onClick={() => setShowUsers(true)}>
            Students
          </a>
          <a href="#" className="p-4" onClick={() => setShowUsers(false)}>
            Scores
          </a>
        </div>
      </div>
      <div className="ml-2 w-3/4">
        <div className="flex justify-between items-center mb-6 ">
          <h2 className="text-3xl font-bold text-indigo-700">Admin Panel</h2>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        {showUsers ? <Users token={token} /> : <Courses />}
      </div>
    </div>
  );
}

export default AdminPanel;
