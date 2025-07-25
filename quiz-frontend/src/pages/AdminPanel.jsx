import React, { useEffect, useState } from "react";
import axios from "axios";
import Users from "./Users";
import Courses from "./Admin/Courses";
import Topics from "./Admin/Topics"; // import Topics
import Questions from "./Admin/Questions";

function AdminPanel() {
  const [showUsers, setShowUsers] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [showTopics, setShowTopics] = useState(false);
  const [topicsCourseId, setTopicsCourseId] = useState(null);
  const token = localStorage.getItem("token");

  const [showQuestions, setShowQuestions] = useState(false);
  const [questionsTopicId, setQuestionsTopicId] = useState(null);

  const handleAddQuestions = (topicId) => {
    setQuestionsTopicId(topicId);
    setShowQuestions(true);
  };

  // Handler to go back to Topics
  const handleBackToTopics = () => {
    setShowQuestions(false);
    setQuestionsTopicId(null);
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/auth/me", {
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

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">
      <div className="w-1/5 bg-gray-500 flex flex-col p-4 gap-12 text-white align-middle text-lg">
        <div className="text-center">
          <h2>Hii.. {userName}</h2>
          <p className="text-sm mt-2">{userEmail}</p>
        </div>
        <div className="flex flex-col text-center">
          <a
            href="#"
            className="p-4"
            onClick={() => {
              setShowUsers(false);
              setShowTopics(false);
            }}
          >
            Home
          </a>
          <a
            href="#"
            className="p-4"
            onClick={() => {
              setShowUsers(false);
              setShowTopics(false);
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
            }}
          >
            Students
          </a>
          <a
            href="#"
            className="p-4"
            onClick={() => {
              setShowUsers(false);
              setShowTopics(false);
            }}
          >
            Scores
          </a>
          <a
            href="#"
            className="p-4"
            onClick={() => {
              setShowUsers(false);
              setShowTopics(false);
            }}
          >
            Add Questions
          </a>
        </div>
      </div>
      <div className="ml-2 w-3/4">
        <div className="flex justify-between items-center mb-6 ">
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
        {showUsers ? (
          <Users token={token} />
        ) : showQuestions && questionsTopicId ? (
          <Questions
            topicId={questionsTopicId}
            token={token}
            onBack={handleBackToTopics}
          />
        ) : showTopics && topicsCourseId ? (
          <Topics
            courseId={topicsCourseId}
            token={token}
            onBack={handleBackToCourses}
            onAddQuestions={handleAddQuestions} // pass handler
          />
        ) : (
          <Courses onEditTopics={handleEditTopics} />
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
