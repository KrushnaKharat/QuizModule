import React, { useEffect, useState } from "react";
import axios from "axios";
import Users from "./Users";
import Courses from "./Admin/Courses";
import Topics from "./Admin/Topics";
import Questions from "./Admin/Questions";

function AdminPanel() {
  const [showUsers, setShowUsers] = useState(false);
  const [attemptScores, setAttemptScores] = useState([]);
  const [showScore, setShowScore] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showTopics, setShowTopics] = useState(false);
  const [topicsCourseId, setTopicsCourseId] = useState(null);
  const token = localStorage.getItem("token");
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionsTopicId, setQuestionsTopicId] = useState(null);
  const [questionsType, setQuestionsType] = useState("questions");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortByBestScore, setSortByBestScore] = useState(""); // "", "asc", "desc"

  const [user, setUser] = useState("");
  const [courses, setCourses] = useState("");
  const [topics, setTopics] = useState("");

  useEffect(() => {
    if (!showUsers && !showScore && !showTopics && !showQuestions) {
      const fetchDashboard = async () => {
        try {
          const [usersRes, coursesRes, topicsRes, attemptsRes] =
            await Promise.all([
              axios
                .get("https://quizmodule.onrender.com/api/auth/users", {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setUser(res.data)),
              axios
                .get("https://quizmodule.onrender.com/api/courses", {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setCourses(res.data)),
              axios
                .get("https://quizmodule.onrender.com/api/course/topics", {
                  headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => setTopics(res.data)),
            ]);
        } catch (e) {
          // Handle error if needed
          console.log(e);
        }
      };
      fetchDashboard();
    }
  }, [token]);

  const Home = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">{user.length}</div>
        <div className="text-lg font-semibold">Total Users</div>
      </div>

      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">{courses.length}</div>
        <div className="text-lg font-semibold">Total Courses</div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">{topics.length}</div>
        <div className="text-lg font-semibold">Total Topics</div>
      </div>
    </div>
  );

  const handleAddQuestions = (topicId) => {
    setQuestionsTopicId(topicId);
    setQuestionsType("questions");
    setShowQuestions(true);
  };
  const handleAddPracticeQuestions = (topicId) => {
    setQuestionsTopicId(topicId);
    setQuestionsType("practicequestions");
    setShowQuestions(true);
  };

  const handleBackToTopics = () => {
    setShowQuestions(false);
    setQuestionsTopicId(null);
    setQuestionsType("questions");
  };

  useEffect(() => {
    axios
      .get("https://quizmodule.onrender.com/api/auth/me", {
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

  useEffect(() => {
    if (showScore) {
      axios
        .get(
          "https://quizmodule.onrender.com/api/attempts/admin/attempts/aggregated",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((res) => setAttemptScores(res.data));
    }
  }, [showScore, token]);

  const handleEditTopics = (courseId) => {
    setTopicsCourseId(courseId);
    setShowTopics(true);
  };

  const handleBackToCourses = () => {
    setShowTopics(false);
    setTopicsCourseId(null);
  };

  // Sorting logic: default (""), then asc/desc on click
  let sortedScores = attemptScores.slice();
  if (sortByBestScore === "asc") {
    sortedScores = sortedScores.sort(
      (a, b) => (a.best_score ?? 0) - (b.best_score ?? 0)
    );
  } else if (sortByBestScore === "desc") {
    sortedScores = sortedScores.sort(
      (a, b) => (b.best_score ?? 0) - (a.best_score ?? 0)
    );
  } else {
    sortedScores = sortedScores.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }

  // Filter by search term
  const filteredScores = sortedScores.filter(
    (a) =>
      a.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.topic_title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSortClick = () => {
    setSortByBestScore((prev) => {
      if (prev === "") return "desc";
      if (prev === "desc") return "asc";
      return "desc";
    });
  };

  const Scores = (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        User Quiz Attempts
      </h2>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          placeholder="Search by student, email, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-indigo-300 rounded px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-indigo-100">
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                User
              </th>
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                Course
              </th>
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                Topic
              </th>
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                First Attempt
              </th>
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                Second Attempt
              </th>
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                Third Attempt
              </th>
              <th
                className="py-3 px-4 text-left font-semibold text-indigo-700 cursor-pointer flex items-center gap-2 select-none"
                onClick={handleSortClick}
              >
                Best Score
                <span>
                  {sortByBestScore === "desc" ? (
                    // Down arrow
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M7 10l5 5 5-5"
                        stroke="#4F46E5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : sortByBestScore === "asc" ? (
                    // Up arrow
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M7 14l5-5 5 5"
                        stroke="#4F46E5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    // Neutral (gray up arrow)
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M7 14l5-5 5 5"
                        stroke="#A5B4FC"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredScores.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No attempts found.
                </td>
              </tr>
            ) : (
              filteredScores.map((a, idx) => (
                <tr key={idx} className="hover:bg-indigo-50 transition">
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.user_name}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.course_title}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.topic_title}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.first_attempt !== null ? (
                      a.first_attempt
                    ) : (
                      <span className="text-gray-400">Not attempted yet</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.second_attempt !== null ? (
                      a.second_attempt
                    ) : (
                      <span className="text-gray-400">Not attempted yet</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100">
                    {a.third_attempt !== null ? (
                      a.third_attempt
                    ) : (
                      <span className="text-gray-400">Not attempted yet</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b border-gray-100 font-bold text-green-700">
                    {a.best_score !== null ? (
                      a.best_score
                    ) : (
                      <span className="text-gray-400">Not attempted yet</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/5 bg-gradient-to-b from-indigo-700 to-indigo-900 flex flex-col p-6 gap-12 text-white shadow-2xl">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/pictures/logo.png"
            alt="Logo"
            className="h-16 w-16 rounded-full shadow-lg border-4 border-white"
          />
          <h2 className="text-xl font-bold tracking-wide">{userName}</h2>
          <p className="text-sm text-indigo-200">{userEmail}</p>
        </div>
        <nav className="flex flex-col gap-2 mt-8">
          <button
            className={`py-3 rounded-xl font-semibold transition-all hover:bg-indigo-600 hover:scale-105 ${
              !showUsers && !showTopics && !showScore && !showQuestions
                ? "bg-indigo-600 shadow-lg"
                : ""
            }`}
            onClick={() => {
              setShowUsers(false);
              setShowTopics(false);
              setShowScore(false);
              setShowQuestions(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6"
                />
              </svg>
              Home
            </span>
          </button>
          <button
            className={`py-3 rounded-xl font-semibold transition-all hover:bg-indigo-600 hover:scale-105 ${
              showTopics ? "bg-indigo-600 shadow-lg" : ""
            }`}
            onClick={() => {
              setShowUsers(false);
              setShowTopics(true);
              setShowScore(false);
              setShowQuestions(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 1.343-3 3v5a3 3 0 006 0v-5c0-1.657-1.343-3-3-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 20h14"
                />
              </svg>
              Courses
            </span>
          </button>
          <button
            className={`py-3 rounded-xl font-semibold transition-all hover:bg-indigo-600 hover:scale-105 ${
              showUsers ? "bg-indigo-600 shadow-lg" : ""
            }`}
            onClick={() => {
              setShowUsers(true);
              setShowTopics(false);
              setShowScore(false);
              setShowQuestions(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87"
                />
                <circle
                  cx="12"
                  cy="7"
                  r="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Users
            </span>
          </button>
          <button
            className={`py-3 rounded-xl font-semibold transition-all hover:bg-indigo-600 hover:scale-105 ${
              showScore ? "bg-indigo-600 shadow-lg" : ""
            }`}
            onClick={() => {
              setShowScore(true);
              setShowUsers(false);
              setShowTopics(false);
              setShowQuestions(false);
            }}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19v2m0-2a7 7 0 100-14 7 7 0 000 14z"
                />
              </svg>
              Scores
            </span>
          </button>
        </nav>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="mt-auto bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition"
        >
          Logout
        </button>
      </div>
      {/* Main Content */}
      <div className="flex-1 px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-indigo-800 drop-shadow-lg tracking-tight">
            Admin Dashboard
          </h2>
        </div>
        <div className="w-full">
          {/* Main content switch */}
          {!showScore && !showUsers && !showQuestions && !showTopics ? (
            <div className="animate-fade-in">{Home}</div>
          ) : showScore ? (
            <div className="animate-fade-in">{Scores}</div>
          ) : showUsers ? (
            <div className="animate-fade-in">
              <Users token={token} />
            </div>
          ) : showQuestions && questionsTopicId ? (
            <div className="animate-fade-in">
              <Questions
                topicId={questionsTopicId}
                token={token}
                onBack={handleBackToTopics}
                type={questionsType}
              />
            </div>
          ) : showTopics && topicsCourseId ? (
            <div className="animate-fade-in">
              <Topics
                courseId={topicsCourseId}
                token={token}
                onBack={handleBackToCourses}
                onAddQuestions={handleAddQuestions}
                onAddPracticeQuestions={handleAddPracticeQuestions}
              />
            </div>
          ) : (
            <div className="animate-fade-in">
              <Courses onEditTopics={handleEditTopics} />
            </div>
          )}
        </div>
      </div>
      <style>
        {`
        .animate-fade-in {
          animation: fadeIn 0.7s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}
      </style>
    </div>
  );
}

export default AdminPanel;
