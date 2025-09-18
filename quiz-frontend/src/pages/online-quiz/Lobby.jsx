import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function Lobby() {
  const { session_id } = useParams();
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("pending");
  const [hostId, setHostId] = useState(null);
  const [hostName, setHostName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch lobby users and session info
  useEffect(() => {
    const fetchLobby = () => {
      axios
        .get(`https://quizmodule.onrender.com/api/groupquiz/lobby/${session_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUsers(res.data));
      axios
        .get(`https://quizmodule.onrender.com/api/groupquiz/sessioninfo/${session_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setStatus(res.data.status);
          setHostId(res.data.host_id);
          setHostName(res.data.host_name);
        });
    };
    fetchLobby();
    const interval = setInterval(fetchLobby, 2000);
    return () => clearInterval(interval);
  }, [session_id, token]);

  // Get current user id
  useEffect(() => {
    axios
      .get("https://quizmodule.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCurrentUserId(res.data.id));
  }, [token]);

  useEffect(() => {
    if (status === "active") {
      navigate(`/groupquiz/${session_id}`);
    }
  }, [status, session_id, navigate]);

  const handleStart = () => {
    axios.put(
      `https://quizmodule.onrender.com/api/groupquiz/start/${session_id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="bg-white shadow-lg rounded-xl px-8 py-8 w-full max-w-xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-2">Group Quiz Lobby</h2>
        <div className="mb-4 text-indigo-600 font-semibold">
          Host: <span className="text-indigo-900">{hostName}</span>
        </div>
        <div className="mb-4">
          <span className="font-semibold text-indigo-700">Participants:</span>
          <ul className="mt-2">
            {users.map((u) => (
              <li key={u.id} className="py-1 px-2 rounded text-indigo-800 bg-indigo-50 mb-1">
                {u.name} {u.id === hostId && <span className="text-xs text-white bg-indigo-600 px-2 py-1 rounded ml-2">Host</span>}
              </li>
            ))}
          </ul>
        </div>
        {currentUserId === hostId && (
          <button
            className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
            onClick={handleStart}
          >
            Start Quiz
          </button>
        )}
        <div className="mt-6 text-gray-500 text-sm">
          Waiting for host to start the quiz...
        </div>
      </div>
    </div>
  );
}

export default Lobby;