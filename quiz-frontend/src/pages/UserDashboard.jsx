import React, { useEffect, useState } from "react";
import axios from "axios";

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const quizEmojis = ["🐍", "💻", "📊", "📚", "🧮", "🖥️", "🔢", "📝"];
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(null);

  // Get userId as in QuizPage.jsx
  useEffect(() => {
    if (token) {
      axios
        .get("https://quizmodule.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setUserId(res.data.id))
        .catch(() => setUserId(null));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-700">Your Courses</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
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
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="cursor-pointer rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition transform p-6 bg-gradient-to-br from-blue-100 to-indigo-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-indigo-700">
                      {topic.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    Start your quiz on this topic.
                  </p>
                  <div className="flex justify-between">
                    <div
                      className="mt-2 text-indigo-600 font-medium underline cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/quiz/${topic.id}`)
                      }
                    >
                      Start Quiz →
                    </div>
                    <div
                      className="mt-2 text-blue-500 font-medium underline cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/practicequiz/${topic.id}`)
                      }
                    >
                      Start Practice Quiz →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
