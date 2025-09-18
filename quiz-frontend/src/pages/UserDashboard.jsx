import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import NotificationBell from "./NotificationBell";

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const quizEmojis = ["🐍", "💻", "📊", "📚", "🧮", "🖥️", "🔢", "📝"];
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(null);

  const [topicStats, setTopicStats] = useState({});
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Get userId and userName
  useEffect(() => {
    if (token) {
      axios
        .get("https://quizmodule.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setUserId(res.data.id);
          setUserName(res.data.name);
        })
        .catch(() => {
          setUserId(null);
          setUserName("");
        });
    }
  }, [token]);

  // Fetch only user's assigned courses
  useEffect(() => {
    if (userId) {
      setLoading(true);
      axios
        .get(
          `https://quizmodule.onrender.com/api/auth/users/${userId}/courses`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) =>
          setQuizzes(res.data.map((c) => ({ ...c, id: Number(c.id) })))
        )
        .catch(() => setError("Failed to fetch your courses."))
        .finally(() => setLoading(false));
    }
  }, [userId, token]);

  // Fetch topics for selected course
  useEffect(() => {
    if (selectedCourse) {
      setLoading(true);
      axios
        .get(
          `https://quizmodule.onrender.com/api/course/${selectedCourse.id}/topics`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => setTopics(res.data))
        .catch(() => setError("Failed to fetch topics."))
        .finally(() => setLoading(false));
    }
  }, [selectedCourse, token]);

  // Fetch topic stats (best score and remaining attempts) for each topic
  useEffect(() => {
    if (selectedCourse && topics.length > 0 && userId) {
      // Fetch stats for all topics in parallel
      Promise.all(
        topics.map((topic) =>
          axios
            .get(
              `https://quizmodule.onrender.com/api/attempts/remaining/${userId}/${topic.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => ({
              topicId: topic.id,
              remaining: res.data.remaining,
              maxAttempts: res.data.maxAttempts,
            }))
            .catch(() => ({
              topicId: topic.id,
              remaining: null,
              maxAttempts: 3,
            }))
        )
      ).then((attemptsArr) => {
        // Fetch best score for each topic
        Promise.all(
          topics.map((topic) =>
            axios
              .get(
                `https://quizmodule.onrender.com/api/attempts/admin/attempts?userId=${userId}&topicId=${topic.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then((res) => {
                // Find best score for this topic
                const attempts = res.data.filter(
                  (a) => a.topic_id === topic.id && a.user_id === userId
                );
                const bestScore =
                  attempts.length > 0
                    ? Math.max(...attempts.map((a) => a.score))
                    : null;
                return { topicId: topic.id, bestScore };
              })
              .catch(() => ({ topicId: topic.id, bestScore: null }))
          )
        ).then((scoresArr) => {
          // Merge attempts and scores
          const stats = {};
          attemptsArr.forEach((a) => {
            stats[a.topicId] = {
              remaining: a.remaining,
              maxAttempts: a.maxAttempts,
            };
          });
          scoresArr.forEach((s) => {
            if (!stats[s.topicId]) stats[s.topicId] = {};
            stats[s.topicId].bestScore = s.bestScore;
          });
          setTopicStats(stats);
        });
      });
    }
  }, [topics, selectedCourse, userId, token]);

  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setError("");
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setTopics([]);
    setError("");
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white pl-6 pr-6 ">
      <div className="flex items-center justify-between mb-8 border-b-4 border-purple-600 py-4 px-2 rounded-xl shadow">
        {/* Logo and Brand */}
        <div className="flex items-center ">
          <img
            className="h-16 w-16 object-contain"
            src="/pictures/logo.png"
            alt="Company Logo"
          />
          <span className=" text-lg text-indigo-800 font-bold  ">
            Applied InSights
          </span>
        </div>
        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-indigo-700 text-center flex-1">
          <button
            className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
            onClick={() => window.open("https://appliedinsights.in/", "_blank")}
          >
            Visit Our Website
          </button>
        </h1>
        <button
          className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
          onClick={() => navigate("/quizgame")}
        >
          Quiz Game
        </button>

        {/* User Name and Logout */}
        <div className="flex items-center gap-4">
          <NotificationBell userId={userId} token={token} />
          <span className="text-indigo-700 font-semibold text-lg">
            {userName && `Hi, ${userName}`}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition text-white px-6 py-2 rounded-lg font-semibold shadow"
          >
            Logout
          </button>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading && <div className="text-blue-700 mb-4">Loading...</div>}

      {!selectedCourse ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.length === 0 ? (
            <div className="text-gray-600">No purchased courses found.</div>
          ) : (
            quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                onClick={() => handleCourseClick(quiz)}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transform transition duration-300 p-6 cursor-pointer"
                style={{
                  animation: "fadeInUp 0.7s ease forwards",
                  animationDelay: `${index * 120}ms`,
                  opacity: 0,
                  pointerEvents: "auto",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-indigo-700">
                    {quiz.title}
                  </h2>
                  <span className="text-3xl">
                    {quizEmojis[index % quizEmojis.length]}
                  </span>
                </div>
                <div className="mt-4 text-sm text-indigo-600 font-medium underline transition opacity-100">
                  View Topics →
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          <button
            className="mb-4 text-blue-600 underline"
            onClick={handleBackToCourses}
          >
            &larr; Back to Courses
          </button>
          <h2 className="text-2xl font-bold mb-6 text-indigo-700">
            Topics in {selectedCourse.title}
          </h2>
          {topics.length === 0 ? (
            <p className="text-gray-600">No topics found for this course.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => {
                const stats = topicStats[topic.id] || {};
                return (
                  <div
                    key={topic.id}
                    className="cursor-pointer rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition transform p-6 bg-gradient-to-br from-blue-100 to-indigo-200"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-bold text-indigo-700">
                            {topic.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700">
                          Start your quiz on this topic.
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-green-700 text-sm font-semibold">
                          Best Score:{" "}
                          {typeof stats.bestScore === "number"
                            ? `${stats.bestScore}/10`
                            : "—"}
                        </span>
                        <span className="text-orange-700 text-sm font-semibold">
                          Remaining Attempts:{" "}
                          {typeof stats.remaining === "number"
                            ? `${stats.remaining}/${stats.maxAttempts || 3}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div
                        className="text-blue-500 font-medium underline cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/practicequiz/${topic.id}`)
                        }
                      >
                        Start Practice Quiz →
                      </div>
                      <div
                        className="text-indigo-600 font-medium underline cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/quiz/${topic.id}`)
                        }
                      >
                        Start Quiz →
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
