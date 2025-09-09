import React, { useEffect, useState } from "react";
import axios from "axios";
import Users from "./Users";
import Courses from "./Admin/Courses";
import Topics from "./Admin/Topics"; // import Topics
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

  // Handler to open Topics
  const handleEditTopics = (courseId) => {
    setTopicsCourseId(courseId);
    setShowTopics(true);
  };

  // Handler to go back to Courses
  const handleBackToCourses = () => {
    setShowTopics(false);
    setTopicsCourseId(null);
  };

  const Scores = (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        User Quiz Attempts
      </h2>
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
              <th className="py-3 px-4 text-left font-semibold text-indigo-700">
                Best Score
              </th>
            </tr>
          </thead>
          <tbody>
            {attemptScores.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No attempts found.
                </td>
              </tr>
            ) : (
              attemptScores.map((a, idx) => (
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
      <div className="ml-2 w-3/4  ">
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
        {showScore ? (
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
