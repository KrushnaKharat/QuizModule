import React, { useState, useEffect } from "react";
import axios from "axios";

function QuizGame() {
  const [showForm, setShowForm] = useState(false);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Fetched from backend
  const [courses, setCourses] = useState([]);
  const [topics, setTopics] = useState([]);

  // Example scoreboard data: groupName -> [{ name, score }]
  const [scoreBoard, setScoreBoard] = useState({
    "Alpha Group": [
      { name: "Alice", score: 8 },
      { name: "Bob", score: 6 },
    ],
    "Beta Group": [
      { name: "Charlie", score: 7 },
      { name: "You", score: 9 },
    ],
  });

  // Fetch courses when form opens
  useEffect(() => {
    if (showForm) {
      axios
        .get("https://quizmodule.onrender.com/api/courses")
        .then((res) => setCourses(res.data))
        .catch(() => setCourses([]));
    }
  }, [showForm]);

  // Fetch topics when course changes
  useEffect(() => {
    if (course) {
      axios
        .get(`https://quizmodule.onrender.com/api/courses/${course}/topics`)
        .then((res) => setTopics(res.data))
        .catch(() => setTopics([]));
    } else {
      setTopics([]);
    }
  }, [course]);

  const handleHostGame = (e) => {
    e.preventDefault();
    alert(
      `Game Hosted!\nCourse: ${course}\nTopic: ${topic}\nGroup: ${groupName}\nInvite: ${email}`
    );
    setShowForm(false);
    if (groupName && email) {
      setScoreBoard((prev) => {
        const updated = { ...prev };
        if (!updated[groupName]) updated[groupName] = [];
        updated[groupName].push({ name: email, score: 0 });
        return updated;
      });
    }
  };

  // Calculate group total scores
  const groupScores = Object.entries(scoreBoard).map(([group, members]) => ({
    group,
    total: members.reduce((sum, m) => sum + m.score, 0),
    members,
  }));

  return (
    <div className="p-8 flex flex-col items-center">
      <button
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition mb-6"
        onClick={() => setShowForm(true)}
      >
        Host Game
      </button>

      {showForm && (
        <form
          className="bg-white shadow-lg rounded-lg p-6 mb-8 w-full max-w-md flex flex-col gap-4"
          onSubmit={handleHostGame}
        >
          <h2 className="text-xl font-bold text-indigo-700 mb-2">
            Host a Game
          </h2>
          <label className="flex flex-col">
            Select Course:
            <select
              className="border rounded px-2 py-1 mt-1"
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setTopic("");
              }}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c._id || c.id} value={c._id || c.id}>
                  {c.title || c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Select Topic:
            <select
              className="border rounded px-2 py-1 mt-1"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              disabled={!course}
            >
              <option value="">-- Select Topic --</option>
              {topics.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.title || t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col">
            Group Name:
            <input
              type="text"
              className="border rounded px-2 py-1 mt-1"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              required
            />
          </label>
          <label className="flex flex-col">
            Invite Friend (Email):
            <input
              type="email"
              className="border rounded px-2 py-1 mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              required
            />
          </label>
          <div className="flex gap-4 mt-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Host
            </button>
            <button
              type="button"
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Score Board */}
      <div className="bg-indigo-50 rounded-lg shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-indigo-700 mb-4">Score Board</h2>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="text-left py-2">Group Name</th>
              <th className="text-left py-2">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {groupScores.map((g, idx) => (
              <tr
                key={g.group}
                className="cursor-pointer hover:bg-indigo-100"
                onClick={() => setSelectedGroup(g)}
              >
                <td className="py-1 font-semibold text-indigo-700">
                  {g.group}
                </td>
                <td className="py-1">{g.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Group Members Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4 text-indigo-700">
              {selectedGroup.group} Members
            </h3>
            <table className="w-full mb-4">
              <thead>
                <tr>
                  <th className="text-left py-1">Name</th>
                  <th className="text-left py-1">Score</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.members.map((m, i) => (
                  <tr key={i}>
                    <td className="py-1">{m.name}</td>
                    <td className="py-1">{m.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={() => setSelectedGroup(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizGame;