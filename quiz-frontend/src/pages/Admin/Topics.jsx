import React, { useEffect, useState } from "react";
import axios from "axios";

function Topics({ courseId, onBack, token, onAddQuestions }) {
  const [newTopic, setNewTopic] = useState({ title: "" });
  const [topics, setTopics] = useState([]);
  const [editTopicId, setEditTopicId] = useState(null);
  const [editTopicTitle, setEditTopicTitle] = useState("");

  const handleAddTopic = async () => {
    if (!newTopic.title.trim()) {
      alert("Topic title cannot be empty");
      return;
    }
    try {
      await axios.post(
        `http://localhost:5000/api/course/${courseId}/topics`,
        { title: newTopic.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTopic({ title: "" });
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
        `http://localhost:5000/api/course/${courseId}/topics`,
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
        `http://localhost:5000/api/course/${courseId}/topics/${topicId}`,
        { title: editTopicTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTopics();
      setEditTopicId(null);
      setEditTopicTitle("");
    } catch (err) {
      alert("Failed to edit topic");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/course/${courseId}/topics/${topicId}`,
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
      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 rounded"
          placeholder="New Topic"
          value={newTopic.title}
          onChange={(e) => setNewTopic({ title: e.target.value })}
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
            className="flex items-center justify-between mb-2"
          >
            {editTopicId === topic.id ? (
              <>
                <input
                  className="border p-1 rounded"
                  value={editTopicTitle}
                  onChange={(e) => setEditTopicTitle(e.target.value)}
                />
                <button
                  className="bg-green-500 text-white px-2 py-1 rounded ml-2"
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
              </>
            ) : (
              <>
                <div className=" flex w-full ">
                  <p>{topic.title} </p>
                  <div className="flex w-full ">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => {
                        setEditTopicId(topic.id);
                        setEditTopicTitle(topic.title);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteTopic(topic.id)}
                    >
                      Delete Topic
                    </button>
                  </div>
                </div>
                <div>
                  <button
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                    onClick={() => onAddQuestions(topic.id)}
                  >
                    Add Questions
                  </button>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Topics;
