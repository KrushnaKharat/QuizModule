import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function QuizGame() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [groupName, setGroupName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [inviteEmails, setInviteEmails] = useState("");
  const [allEmails, setAllEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hostId, setHostId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://quizmodule.onrender.com/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourses(res.data));
    axios
      .get("https://quizmodule.onrender.com/api/auth/emails", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllEmails(res.data.map((u) => u.email)));
    axios
      .get("https://quizmodule.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setHostId(res.data.id));
  }, [token]);

  useEffect(() => {
    if (course) {
      axios
        .get(`https://quizmodule.onrender.com/api/course/${course}/topics`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setTopics(res.data));
    }
  }, [course, token]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmailInput(value);
    if (value.length > 0) {
      setSuggestions(
        allEmails.filter(
          (email) =>
            email.toLowerCase().includes(value.toLowerCase()) &&
            !inviteEmails
              .split(",")
              .map((em) => em.trim())
              .includes(email)
        )
      );
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (email) => {
    setInviteEmails(
      inviteEmails ? inviteEmails.replace(/,\s*$/, "") + ", " + email : email
    );
    setEmailInput("");
    setSuggestions([]);
  };

  const handleHost = async (e) => {
    e.preventDefault();
    // 1. Create session
    const sessionRes = await axios.post(
      "https://quizmodule.onrender.com/api/groupquiz/session",
      {
        host_id: hostId,
        course_id: course,
        topic_id: topic,
        group_name: groupName,
        total_questions: totalQuestions,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const session_id = sessionRes.data.session_id;

    // 2. Get user IDs by email
    const emails = inviteEmails.split(",").map((e) => e.trim());
    const usersRes = await axios.get(
      "https://quizmodule.onrender.com/api/auth/emails",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const user_ids = usersRes.data
      .filter((u) => emails.includes(u.email))
      .map((u) => u.id);

    // 3. Invite users
    await axios.post(
      "https://quizmodule.onrender.com/api/groupquiz/invite",
      {
        session_id,
        user_ids,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 4. Redirect to lobby
    navigate(`/lobby/${session_id}`);
  };

  return (
    <form
      onSubmit={handleHost}
      className="max-w-lg mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-8 flex flex-col gap-6 mt-4 sm:mt-8 w-full"
    >
      <h2 className="text-2xl font-bold text-indigo-700 mb-2">
        Host a Group Quiz
      </h2>
      <div>
        <label className="block font-semibold mb-1 text-indigo-700">
          Group Name
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
          className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Enter group name"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-indigo-700">
          Course
        </label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          required
          className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Select course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-indigo-700">
          Topic
        </label>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
          className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          disabled={!course}
        >
          <option value="">Select topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1 text-indigo-700">
          Total Questions
        </label>
        <input
          type="number"
          min={1}
          max={50}
          value={totalQuestions}
          onChange={(e) => setTotalQuestions(Number(e.target.value))}
          required
          className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Number of questions"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-indigo-700">
          Invite Users with Email Id's
        </label>
        <div className=" w-full flex mb-2">
          <input
            type="text"
            value={emailInput}
            onChange={handleEmailChange}
            className="flex-1 min-w-[120px] border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Type email to search"
            style={{ minWidth: "120px" }}
          />
        </div>

        {suggestions.length > 0 && (
          <ul className="bg-white border rounded shadow mt-1 max-h-32 overflow-y-auto z-10 absolute">
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
        <div className="flex flex-wrap gap-2 mb-2">
          {inviteEmails
            .split(",")
            .map((email) => email.trim())
            .filter((email) => email.length > 0)
            .map((email) => (
              <span
                key={email}
                className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow"
              >
                {email}
                <button
                  type="button"
                  className="ml-2 text-indigo-500 hover:text-red-500 focus:outline-none"
                  onClick={() => {
                    const emails = inviteEmails
                      .split(",")
                      .map((em) => em.trim())
                      .filter((em) => em && em !== email);
                    setInviteEmails(emails.join(", "));
                  }}
                  aria-label={`Remove ${email}`}
                >
                  &times;
                </button>
              </span>
            ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold text-lg shadow-lg hover:scale-105 transition"
      >
        Host Group Quiz
      </button>
    </form>
  );
}

export default QuizGame;
