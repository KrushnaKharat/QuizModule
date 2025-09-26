import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import Loader from "./Loader";

function UserDashboard() {
  const [allCourses, setAllCourses] = useState([]);
  const [userCourses, setUserCourses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [topicStats, setTopicStats] = useState({});
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showLockPrompt, setShowLockPrompt] = useState(false);
  const [lockedCourse, setLockedCourse] = useState(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const courseImages = [
    {
      id: 2,
      src: "public/pictures/image.png",
    },
    {
      id: 4,
      src: "public/pictures/statistics.png",
    },
    {
      id: 5,
      src: "public/pictures/powerbi.png",
    },
    {
      id: 6,
      src: "public/pictures/sql.png",
    },
    {
      id: 7,
      src: "public/pictures/excel.png",
    },
    {
      id: 8,
      src: "public/pictures/datapre.png",
    },
    {
      id: 9,
      src: "public/pictures/machine.png",
    },
    {
      id: 10,
      src: "public/pictures/deep.png",
    },
    {
      id: 11,
      src: "public/pictures/genai.png",
    },
    {
      id: 12,
      src: "public/pictures/nlp.png",
    },
  ];

  // Fetch all courses
  useEffect(() => {

    if (token) {
      setLoading(true);
      axios
        .get("https://quizmodule.onrender.com/api/courses", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) =>
          setAllCourses(res.data.map((c) => ({ ...c, id: Number(c.id) })))
        )
        .catch(() => setError("Failed to fetch all courses."))
        .finally(() => setLoading(false));
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
          setUserCourses(res.data.map((c) => ({ ...c, id: Number(c.id) })))
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
        Promise.all(
          topics.map((topic) =>
            axios
              .get(
                `https://quizmodule.onrender.com/api/attempts/admin/attempts?userId=${userId}&topicId=${topic.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
              .then((res) => {
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

  const handleCourseClick = (course, isUnlocked) => {
    if (isUnlocked) {
      setSelectedCourse(course);
      setError("");
    }
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

  // Helper: check if course is unlocked for user
  const isCourseUnlocked = (courseId) =>
    userCourses.some((c) => c.id === courseId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white pl-2 pr-2 sm:pl-6 sm:pr-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 border-b-4 border-purple-600 py-4 px-2 rounded-xl shadow gap-4 sm:gap-0">
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
        <div className="flex gap-2 ">
          <div className="flex gap-2">
            <button
              className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-indigo-700 transition"
              onClick={() =>
                window.open("https://appliedinsights.in/", "_blank")
              }
            >
              Visit Our Website
            </button>
            <button
              className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:from-blue-600 hover:to-indigo-700 transition"
              onClick={() => {
                setShowDropdown(false);
                navigate("/quizgame");
              }}
            >
              Host a Quiz
            </button>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition font-semibold text-indigo-700"
                onClick={() => setShowDropdown((prev) => !prev)}
              >
                {userName && `Hi, ${userName}`}
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
            {/* Notification Bell */}
            <NotificationBell userId={userId} token={token} />
          </div>
        </div>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <Loader text="Loading dashboard..." />
      ) : (
        !selectedCourse ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.length === 0 ? (
              <div className="text-gray-600">No courses found.</div>
            ) : (
              allCourses.map((course, index) => {
                const unlocked = isCourseUnlocked(course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => handleCourseClick(course, unlocked)}
                    className={`group bg-white rounded-xl shadow-lg transition duration-300 p-6 cursor-pointer relative ${unlocked
                        ? "hover:shadow-xl hover:scale-[1.03]"
                        : "opacity-60 cursor-not-allowed"
                      }`}
                    style={{
                      animation: "fadeInUp 0.7s ease forwards",
                      animationDelay: `${index * 120}ms`,
                      opacity: 0,
                      pointerEvents: "auto",
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-indigo-700">
                        {course.title}
                      </h2>
                      {unlocked ? (
                        <img
                          src={(() => {
                            const imgObj = courseImages.find(
                              (img) => img.id === course.id
                            );
                            return imgObj
                              ? `/${imgObj.src.replace(/^public\//, "")}`
                              : "/pictures/image.png";
                          })()}
                          alt={course.title}
                          className="h-16"
                          srcSet=""
                        />
                      ) : (
                        <span
                          title="Locked"
                          className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 text-gray-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLockedCourse(course);
                            setShowLockPrompt(true);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.5 10.5V7a4.5 4.5 0 00-9 0v3.5M5.25 10.5h13.5A2.25 2.25 0 0121 12.75v6A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75v-6A2.25 2.25 0 015.25 10.5z"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-indigo-600 font-medium underline transition opacity-100">
                      {unlocked ? "View Topics →" : "Locked"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div>
            <button
              className="text-white bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-4 focus:ring-purple-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
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
                          <span className="text-indigo-700 flex text-sm font-semibold">
                            Best Score:{" "}
                            <p className="font-bold">
                              {typeof stats.bestScore === "number"
                                ? ` ${stats.bestScore}/10`
                                : "—"}
                            </p>
                          </span>
                          <span className="text-orange-700 flex text-sm font-semibold">
                            Remaining Attempts:{" "}
                            <p className=" font-bold">
                              {typeof stats.remaining === "number"
                                ? `${stats.remaining}/${stats.maxAttempts || 3}`
                                : "—"}
                            </p>
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-8 ">
                        <button
                          className="text-white bg-blue-500 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
                          onClick={() =>
                            (window.location.href = `/practicequiz/${topic.id}`)
                          }
                        >
                          Start Practice Quiz
                        </button>
                        <button
                          className="text-white bg-indigo-500 hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-900"
                          onClick={() =>
                            (window.location.href = `/quiz/${topic.id}`)
                          }
                        >
                          Start Quiz →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )

      )
      }


      {showLockPrompt && lockedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold text-indigo-700 mb-4">
              {lockedCourse.title} is Locked
            </h2>
            <p className="mb-4 text-gray-700">
              This course is currently locked for your account.
              <br />
              <span className="font-semibold text-indigo-600">
                To unlock this course, please contact your administrator or
                course manager.
              </span>
              <br />
              You may also check if you need to complete prerequisites or
              request access from your instructor.
            </p>
            <button
              className="mt-2 px-6 py-2 bg-indigo-500 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition"
              onClick={() => setShowLockPrompt(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
