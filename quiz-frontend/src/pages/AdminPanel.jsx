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
  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalCourses: 0,
    courseTopics: [],
    usersSolved: 0,
    usersRemaining: 0,
  });
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
              axios.get(
                "https://quizmodule.onrender.com/api/attempts/admin/attempts/aggregated",
                { headers: { Authorization: `Bearer ${token}` } }
              ),
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
      <div className="bg-gradient-to-br from-green-400 to-blue-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">
          {dashboard.totalAdmins}
        </div>
        <div className="text-lg font-semibold">Total Admins</div>
      </div>
      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">{courses.length}</div>
        <div className="text-lg font-semibold">Total Courses</div>
      </div>
      <div className="bg-gradient-to-br from-pink-400 to-red-500 text-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
        <div className="text-4xl font-extrabold mb-2">{topics.length}</div>
        <div className="text-lg font-semibold">Topics</div>
      </div>
      <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-lg p-8 mt-4">
        <div className="text-xl font-bold text-indigo-700 mb-4">
          Course Topics
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboard.courseTopics.map((ct, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-3"
            >
              <span className="font-semibold text-indigo-700">
                {ct.courseTitle}
              </span>
              <span className="text-indigo-500 font-bold">
                {ct.topicCount} Topics
              </span>
            </div>
          ))}
        </div>
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
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">
      <div className="w-1/5 bg-gray-500 flex flex-col p-4 gap-12 text-white align-middle text-lg">
        <div className="w-full bg-gray-500 flex flex-col p-4 gap-12 text-white align-middle text-lg">
          <div className="text-center">
            <h2>{userName}</h2>
            <p className="text-sm mt-2">{userEmail}</p>
          </div>
          <div className="flex flex-col text-center">
            <a
              href="#"
              className="p-4"
              onClick={() => {
                setShowUsers(false);
                setShowTopics(false);
                setShowScore(false);
                setShowQuestions(false);
              }}
            >
              Home
            </a>
            <a
              href="#"
              className="p-4"
              onClick={() => {
                setShowUsers(false);
                setShowTopics(true);
                setShowScore(false);
                setShowQuestions(false);
              }}
            >
              Courses
            </a>
            <a
              href="#"
              className="p-4"
              onClick={() => {
                setShowUsers(true);
                setShowTopics(false);
                setShowScore(false);
                setShowQuestions(false);
              }}
            >
              Users
            </a>
            <a
              href="#"
              className="p-4"
              onClick={() => {
                setShowScore(true);
                setShowUsers(false);
                setShowTopics(false);
                setShowQuestions(false);
              }}
            >
              Scores
            </a>
          </div>
        </div>
      </div>
      <div className="ml-2 w-3/4">
        <div className="flex justify-between items-center mb-6 mt-10">
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
        {/* Main content switch */}
        {!showScore && !showUsers && !showQuestions && !showTopics ? (
          Home
        ) : showScore ? (
          Scores
        ) : showUsers ? (
          <Users token={token} />
        ) : showQuestions && questionsTopicId ? (
          <Questions
            topicId={questionsTopicId}
            token={token}
            onBack={handleBackToTopics}
            type={questionsType}
          />
        ) : showTopics && topicsCourseId ? (
          <Topics
            courseId={topicsCourseId}
            token={token}
            onBack={handleBackToCourses}
            onAddQuestions={handleAddQuestions}
            onAddPracticeQuestions={handleAddPracticeQuestions}
          />
        ) : (
          <Courses onEditTopics={handleEditTopics} />
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
