import React, { useEffect, useState } from "react";
import axios from "axios";

function NotificationBell({ userId, token, onRespond }) {
  const [invitations, setInvitations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchInvites = () => {
      axios
        .get(`https://quizmodule.onrender.com/api/groupquiz/invitations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setInvitations(res.data);
          setLoading(false);
        });
    };
    fetchInvites();
    const interval = setInterval(fetchInvites, 10000);
    return () => clearInterval(interval);
  }, [userId, token]);

  const handleRespond = (invitation_id, status, session_id) => {
    axios
      .put(
        `https://quizmodule.onrender.com/api/groupquiz/invitation/${invitation_id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitation_id)
        );
        if (onRespond) onRespond();
        // If accepted, go to lobby
        if (status === "accepted") {
          window.location.href = `/lobby/${session_id}`;
        }
      });
  };

  return (
    <>
      {loading ? (
        <div className="p-4 text-center">Loading invitations...</div>
      ) : (
        <div className="relative">
          <button
            className="relative"
            onClick={() => setShowDropdown((s) => !s)}
            title="Group Quiz Invitations"
          >
            <svg
              className="w-7 h-7 text-indigo-700"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {invitations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full px-2 text-xs">
                {invitations.length}
              </span>
            )}
          </button>
          {showDropdown && invitations.length > 0 && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50 p-4">
              <h4 className="font-bold mb-2">Group Quiz Invitations</h4>
              {invitations.map((inv) => (
                <div key={inv.id} className="mb-3 border-b pb-2">
                  <div>
                    <span className="font-semibold">{inv.host_name}</span>{" "}
                    invited you to join{" "}
                    <span className="font-semibold">{inv.group_name}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleRespond(inv.id, "accepted", inv.session_id)
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() =>
                        handleRespond(inv.id, "rejected", inv.session_id)
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default NotificationBell;
