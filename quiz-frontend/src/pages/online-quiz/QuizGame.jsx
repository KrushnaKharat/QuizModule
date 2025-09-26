import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader";

// Helper to fetch course and topic names by ID
const getCourseName = async (id, token) => {
  try {
    const res = await axios.get(
      `https://quizmodule.onrender.com/api/courses/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.title || id;
  } catch {
    return id;
  }
};
const getTopicName = async (courseId, topicId, token) => {
  try {
    const res = await axios.get(
      `https://quizmodule.onrender.com/api/course/${courseId}/topics/${topicId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.title || topicId;
  } catch {
    return topicId;
  }
};

function UserGroupQuizzes({ userId, token }) {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [participants, setParticipants] = useState({});
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
   const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    if (!userId) return;
    axios
      .get(
        `https://quizmodule.onrender.com/api/groupquiz/sessions/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(async (res) => {
        // Sort by latest (assuming quiz.id is incremental, otherwise use created_at)
        const sorted = [...res.data].sort((a, b) => b.id - a.id);
        const quizzesWithDetails = await Promise.all(
          sorted.map(async (quiz) => {
            const courseName = quiz.course_name || await getCourseName(quiz.course_id, token);
            const topicName = quiz.topic_name || await getTopicName(quiz.course_id, quiz.topic_id, token);
            let topScore = null;
            let topUser = null;
            try {
              const resultsRes = await axios.get(
                `https://quizmodule.onrender.com/api/groupquiz/results/${quiz.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const results = resultsRes.data;
              if (results.length > 0) {
                const maxScore = Math.max(...results.map((r) => r.score));
                const top = results.find((r) => r.score === maxScore);
                topScore = maxScore;
                topUser = top ? top.name : null;
              }
            } catch {}
            return {
              ...quiz,
              courseName,
              topicName,
              topScore,
              topUser,
              isHost: quiz.host_id === userId,
            };
          })
        );
        setQuizzes(quizzesWithDetails);
        setLoading(false);
      });
  }, [userId, token]);

  const handleQuizClick = async (quiz) => {
    setSelectedQuizId(selectedQuizId === quiz.id ? null : quiz.id);
    if (selectedQuizId === quiz.id) return;
    setLoadingParticipants(true);
    try {
      const resultsRes = await axios.get(
        `https://quizmodule.onrender.com/api/groupquiz/results/${quiz.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParticipants((prev) => ({
        ...prev,
        [quiz.id]: resultsRes.data,
      }));
    } catch {
      setParticipants((prev) => ({
        ...prev,
        [quiz.id]: [],
      }));
    }
    setLoadingParticipants(false);
  };

  const handleShowMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 10);
      setLoadingMore(false);
    }, 400); // Simulate loading
  };

  if (!userId) return null;
  if (loading) return <Loader text="Loading quizzes..." />;

  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 w-full">
      <h2 className="text-2xl font-extrabold text-indigo-700 mb-4 flex items-center gap-2">
        <span className="inline-block w-2 h-8 bg-indigo-400 rounded-full mr-2"></span>
        Previous Group Quizzes
      </h2>
      {quizzes.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No previous group quizzes found.
        </div>
      ) : (
        <>
         
          <table className="w-full text-left mb-4 rounded-lg overflow-hidden">
            <thead className="bg-indigo-100">
              <tr>
                <th className="py-2 px-3 font-semibold ">Group Name</th>
                <th className="py-2 px-3 font-semibold">Course</th>
                <th className="py-2 px-3 font-semibold">Topic</th>
                <th className="py-2 px-3 font-semibold">Type</th>
                <th className="py-2 px-3 font-semibold">Top Score</th>
                <th className="py-2 px-3 font-semibold">Top Scorer</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.slice(0, visibleCount).map((q) => (
                <React.Fragment key={q.id}>
                  <tr
                    className={`cursor-pointer transition hover:bg-indigo-50 ${selectedQuizId === q.id ? "bg-indigo-50" : ""}`}
                    onClick={() => handleQuizClick(q)}
                  >
                    <td className="py-2 px-3 font-medium">{q.group_name}</td>
                    <td className="py-2 px-3">{q.courseName}</td>
                    <td className="py-2 px-3">{q.topicName}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${q.isHost
                          ? "bg-indigo-200 text-indigo-800"
                          : "bg-green-100 text-green-800"
                        }`}
                      >
                        {q.isHost ? "Hosted" : "Joined"}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {q.topScore !== null ? (
                        <span className="font-bold text-indigo-700">
                          {q.topScore}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {q.topUser ? (
                        <span className="font-semibold text-indigo-600">
                          {q.topUser}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                  {selectedQuizId === q.id && (
                    <tr>
                      <td colSpan={6} className="bg-indigo-50">
                        <div className="p-4">
                          <h3 className="font-bold text-indigo-700 mb-2">
                            Participants & Scores
                          </h3>
                          {loadingParticipants ? (
                            <div className="text-gray-500">Loading...</div>
                          ) : participants[q.id]?.length === 0 ? (
                            <div className="text-gray-500">No results yet.</div>
                          ) : (
                            <table className="w-full text-left rounded">
                              <thead>
                                <tr>
                                  <th className="py-1 px-2">Name</th>
                                  <th className="py-1 px-2">Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants[q.id]?.map((p) => (
                                  <tr key={p.user_id}>
                                    <td className="py-1 px-2">{p.name}</td>
                                    <td className="py-1 px-2 font-bold text-indigo-700">
                                      {p.score}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {visibleCount < quizzes.length && (
            <div className="flex justify-center">
              <button
                onClick={handleShowMore}
                className="px-6 py-2 bg-indigo-500 text-white rounded-full font-semibold shadow hover:bg-indigo-600 transition"
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Show More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
 

function QuizGame() {
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [groupName, setGroupName] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [quizTimer, setQuizTimer] = useState(5);
  const [inviteEmails, setInviteEmails] = useState("");
  const [allEmails, setAllEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [hostId, setHostId] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch hostId and allocated courses
  useEffect(() => {
    axios
      .get("https://quizmodule.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHostId(res.data.id);
        // Fetch only allocated courses for this user
        axios
          .get(
            `https://quizmodule.onrender.com/api/auth/users/${res.data.id}/courses`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((courseRes) => setCourses(courseRes.data));
      });
    axios
      .get("https://quizmodule.onrender.com/api/auth/emails", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllEmails(res.data.map((u) => u.email)));
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
        timer: quizTimer,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 px-2 sm:px-0 flex items-center justify-center">
      <div className="w-3/4 justify-center grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left column: Previous group quizzes */}
        <div className="g-white shadow-xl rounded-2xl p-6 flex flex-col gap-6 mt-2 ">
          <UserGroupQuizzes userId={hostId} token={token} />
        </div>
        {/* Right column: Host a Group Quiz */}
        <form
          onSubmit={handleHost}
          className="bg-white shadow-xl rounded-2xl p-6 flex flex-col gap-6 mt-4 sm:mt-8 "
        >
          <h2 className="text-2xl font-extrabold text-indigo-700 mb-2 flex items-center gap-2">
            <span className="inline-block w-2 h-8 bg-indigo-400 rounded-full mr-2"></span>
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
              Quiz Timer (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={quizTimer}
              onChange={(e) => setQuizTimer(Number(e.target.value))}
              required
              className="w-full border border-indigo-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Quiz duration in minutes"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-indigo-700">
              Invite Users with Email Id's
            </label>
            <div className="w-full flex mb-2">
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
      </div>
    </div>
  );
}

export default QuizGame;