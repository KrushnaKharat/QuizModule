import React, { useEffect, useState } from "react";
import axios from "axios";

function Topics({
  courseId,
  onBack,
  token,
  onAddQuestions,
  onAddPracticeQuestions,
}) {
  const [topics, setTopics] = useState([]);
  const [editTopicId, setEditTopicId] = useState(null);
  const [editTopicTitle, setEditTopicTitle] = useState("");
  const [editTopicLevel, setEditTopicLevel] = useState("");
  const [editTopicTimer, setEditTopicTimer] = useState("");

  const [newTopic, setNewTopic] = useState({
    title: "",
    level: "", // default value
    timer: "", // in seconds or minutes
    max_attempts: 3, // default value
  });

  const handleAddTopic = async () => {
    if (!newTopic.title.trim()) {
      alert("Topic title cannot be empty");
      return;
    }
    try {
      await axios.post(
        `https://quizmodule.onrender.com/api/course/${courseId}/topics`,
        newTopic,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTopic({
        title: "",
        level: "easy",
        timer: "",
        max_attempts: 3,
      });
      fetchTopics();
    } catch (err) {
      alert("Failed to add topic");
    }
  };

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line
  }, [courseId]);

  const fetchTopics = async () => {
    try {
      const res = await axios.get(
        `https://quizmodule.onrender.com/api/course/${courseId}/topics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopics(res.data);
    } catch (err) {
      alert("Failed to fetch topics");
    }
  };

  const handleEditTopic = async (topicId) => {
    try {
      await axios.put(
        `https://quizmodule.onrender.com/api/course/${courseId}/topics/${topicId}`,
        { title: editTopicTitle, level: editTopicLevel, timer: editTopicTimer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTopics();
      setEditTopicId(null);
      setEditTopicTitle("");
      setEditTopicLevel("");
      setEditTopicTimer("");
    } catch (err) {
      alert("Failed to edit topic");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(
        `https://quizmodule.onrender.com/api/course/${courseId}/topics/${topicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTopics();
    } catch (err) {
      alert("Failed to delete topic");
    }
  };

  return (
    <div className="bg-white rounded shadow p-6">
      <button className="mb-4 text-blue-600 underline" onClick={onBack}>
        &larr; Back to Courses
      </button>
      <h3 className="text-xl font-semibold mb-4">Topics</h3>
      <div className="mb-4 flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          placeholder="New Topic"
          value={newTopic.title}
          onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
        />

        <select
          className="border p-2 rounded"
          value={newTopic.level}
          onChange={(e) => setNewTopic({ ...newTopic, level: e.target.value })}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input
          className="border p-2 rounded"
          type="number"
          min="1"
          placeholder="Timer (minutes)"
          value={newTopic.timer}
          onChange={(e) => setNewTopic({ ...newTopic, timer: e.target.value })}
        />
        <input
          className="border p-2 rounded"
          type="number"
          min="1"
          max="3"
          placeholder="Max Attempts (default 3)"
          value={newTopic.max_attempts}
          onChange={(e) =>
            setNewTopic({ ...newTopic, max_attempts: e.target.value })
          }
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={handleAddTopic}
        >
          Add Topic
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="text-gray-500">No topics found.</div>
      ) : (
        topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center justify-between mb-2 "
          >
            {editTopicId === topic.id ? (
              <div className="w-full">
                <input
                  className="border p-1 rounded"
                  value={editTopicTitle}
                  onChange={(e) => setEditTopicTitle(e.target.value)}
                />
                <select
                  className="border p-2 rounded"
                  value={editTopicLevel}
                  onChange={(e) => setEditTopicLevel(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  className="border p-2 rounded"
                  type="number"
                  min="1"
                  placeholder="Timer (minutes)"
                  value={editTopicTimer}
                  onChange={(e) => setEditTopicTimer(e.target.value)}
                />
                <button
                  className="bg-orange-400 text-white px-2 py-1 rounded ml-2"
                  onClick={() => handleEditTopic(topic.id)}
                >
                  Save
                </button>
                <button
                  className="bg-gray-400 text-white px-2 py-1 rounded ml-2"
                  onClick={() => setEditTopicId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex w-1/2 justify-between gap-2 ">
                <div className="flex w-full justify-between gap-2 text-center ">
                  <p className="align-middle justify-center content-center text-xl">
                    {topic.title}{" "}
                  </p>
                  <div className="flex justify-end">
                    <button
                      className=" text-black px-2 py-1 rounded mr-2 border hover:bg-gray-300"
                      onClick={() => {
                        setEditTopicId(topic.id);
                        setEditTopicTitle(topic.title);
                      }}
                    >
                      <svg
                        width="30px"
                        height="30px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className=" rounded-full "
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z"
                            fill="#030303"
                          ></path>{" "}
                        </g>
                      </svg>
                    </button>
                    <button
                      className="  px-2 py-1 rounded border hover:bg-red-200"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      <svg
                        width="30px"
                        height="30px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          {" "}
                          <path
                            d="M10 11V17"
                            stroke="#ff0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                          <path
                            d="M14 11V17"
                            stroke="#ff0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                          <path
                            d="M4 7H20"
                            stroke="#ff0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                          <path
                            d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z"
                            stroke="#ff0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                          <path
                            d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                            stroke="#ff0000"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>{" "}
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex w-full">
                  <button
                    className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                    onClick={() => onAddQuestions(topic.id)}
                  >
                    Add Questions
                  </button>
                  <button
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() => onAddPracticeQuestions(topic.id)}
                  >
                    Add Practice Questions
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Topics;
