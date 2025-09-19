import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function Lobby() {
  const { session_id } = useParams();
  const [invites, setInvites] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [hostName, setHostName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [status, setStatus] = useState("pending");
  const [emailInput, setEmailInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allEmails, setAllEmails] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch lobby invitations and session info
  useEffect(() => {
    const fetchLobby = () => {
      axios
        .get(
          `https://quizmodule.onrender.com/api/groupquiz/lobby/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => setInvites(res.data));
      axios
        .get(
          `https://quizmodule.onrender.com/api/groupquiz/sessioninfo/${session_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
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

  // For adding more users
  useEffect(() => {
    axios
      .get("https://quizmodule.onrender.com/api/auth/emails", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllEmails(res.data.map((u) => u.email)));
  }, [token]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    if (value.length > 0) {
      setSuggestions(
        allEmails.filter(
          (email) =>
            email.toLowerCase().includes(value.toLowerCase()) &&
            !invites.map((inv) => inv.email).includes(email)
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = async (email) => {
    setEmailInput("");
    setSuggestions([]);
    // Find user id by email
    const usersRes = await axios.get(
      "https://quizmodule.onrender.com/api/auth/emails",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const user = usersRes.data.find((u) => u.email === email);
    if (!user) return;
    // Send invite
    await axios.post(
      "https://quizmodule.onrender.com/api/groupquiz/invite",
      {
        session_id,
        user_ids: [user.id],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refetch invites
    axios
      .get(
        `https://quizmodule.onrender.com/api/groupquiz/lobby/${session_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => setInvites(res.data));
  };

  useEffect(() => {
    if (status === "active") {
      navigate(`/groupquiz/${session_id}`);
    }
  }, [status, session_id, navigate]);

  // Split invites by status
  const invitedUsers = invites.filter(
    (u) => u.status === "invited" || u.status === "rejected"
  );
  const acceptedUsers = invites.filter((u) => u.status === "accepted");

  const handleStart = () => {
    axios.put(
      `https://quizmodule.onrender.com/api/groupquiz/start/${session_id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-2 sm:px-0">
      <div className="bg-white shadow-lg rounded-xl px-2 sm:px-8 py-4 sm:py-8 w-full max-w-3xl flex flex-col items-center">
        <h2 className="text-2xl font-bold text-indigo-700 mb-2">
          Group Quiz Lobby
        </h2>
        <div className="mb-4 text-indigo-600 font-semibold">
          Host: <span className="text-indigo-900">{hostName}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full">
          {/* Invited Users */}
          <div className="bg-indigo-50 rounded-lg shadow p-4">
            <h3 className="font-bold text-indigo-700 mb-3 flex items-center gap-2">
              Invitations Sent
            </h3>
            {currentUserId === hostId && (
              <div className="relative mb-4">
                <input
                  type="text"
                  value={emailInput}
                  onChange={handleEmailChange}
                  className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Add user by email"
                />
                {suggestions.length > 0 && (
                  <ul className="bg-white border rounded shadow mt-1 max-h-32 overflow-y-auto z-10 absolute w-full">
                    {suggestions.map((email) => (
                      <li
                        key={email}
                        className="px-3 py-1 hover:bg-indigo-100 cursor-pointer"
                        onClick={() => handleSuggestionClick(email)}
                      >
                        {email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 px-2">User</th>
                  <th className="py-1 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {invitedUsers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-gray-400 py-2 text-center">
                      No invitations sent.
                    </td>
                  </tr>
                )}
                {invitedUsers.map((u) => (
                  <tr key={u.email}>
                    <td className="py-1 px-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-200 text-indigo-800 font-bold text-sm">
                        {u.name
                          ? u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : u.email[0].toUpperCase()}
                      </span>
                      <span className="truncate">{u.email}</span>
                    </td>
                    <td className="py-1 px-2">
                      {u.status === "invited" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                          Invited
                        </span>
                      )}
                      {u.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                          Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Accepted Users */}
          <div className="bg-green-50 rounded-lg shadow p-4">
            <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              Participants
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 px-2">Name</th>
                  <th className="py-1 px-2">Email</th>
                </tr>
              </thead>
              <tbody>
                {acceptedUsers.length === 0 && (
                  <tr>
                    <td colSpan={2} className="text-gray-400 py-2 text-center">
                      No participants yet.
                    </td>
                  </tr>
                )}
                {acceptedUsers.map((u) => (
                  <tr key={u.email}>
                    <td className="py-1 px-2 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-green-200 text-green-800 font-bold text-sm">
                        {u.name
                          ? u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : u.email[0].toUpperCase()}
                      </span>
                      <span className="truncate">{u.name}</span>
                    </td>
                    <td className="py-1 px-2">{u.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {currentUserId === hostId && (
          <button
            className="mt-6 px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
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
