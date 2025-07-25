import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data);
      } catch (err) {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleCourseClick = async (course) => {
    setSelectedCourse(course);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/course/${course.id}/topics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopics(res.data);
    } catch (err) {
      setError("Failed to fetch topics.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setTopics([]);
    setError("");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700">🎯 Your Courses</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p className="text-blue-700 text-lg">Loading...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : selectedCourse ? (
        <div>
          <button
            className="mb-4 text-blue-600 underline"
            onClick={handleBackToCourses}
          >
            &larr; Back to Courses
          </button>
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">
            Topics in {selectedCourse.title}
          </h2>
          {topics.length === 0 ? (
            <p className="text-gray-600">No topics found for this course.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:scale-[1.03] transition"
                  onClick={() => navigate(`/quiz/${topic.id}`)}
                >
                  <h3 className="text-lg font-bold text-indigo-700 mb-2">
                    {topic.title}
                  </h3>
                  <div className="text-indigo-600 font-medium underline mt-2">
                    Start Quiz →
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : quizzes.length === 0 ? (
        <p className="text-gray-600">No courses found. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              onClick={() => handleCourseClick(quiz)}
              className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transform transition duration-300 p-6"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-700">
                  {quiz.title}
                </h2>
                <span className="text-3xl">
                  {index % 2 === 0 ? "🧠" : "📘"}
                </span>
              </div>
              <div className="mt-4 text-sm text-indigo-600 font-medium underline opacity-0 group-hover:opacity-100 transition">
                View Topics →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
