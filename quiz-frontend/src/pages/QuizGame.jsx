import React, { useState } from "react";

function QuizGame() {
  const [showForm, setShowForm] = useState(false);
  const [course, setCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [email, setEmail] = useState("");
  const [scoreBoard, setScoreBoard] = useState([
    { name: "Alice", score: 8 },
    { name: "Bob", score: 6 },
    { name: "You", score: 0 },
  ]);

  // Dummy data for courses and topics
  const courses = [
    { id: "1", name: "Math" },
    { id: "2", name: "Science" },
  ];
  const topics = {
    "1": [
      { id: "101", name: "Algebra" },
      { id: "102", name: "Geometry" },
    ],
    "2": [
      { id: "201", name: "Physics" },
      { id: "202", name: "Chemistry" },
    ],
  };

  const handleHostGame = (e) => {
    e.preventDefault();
    // Here you would send data to backend to host game
    alert(
      `Game Hosted!\nCourse: ${course}\nTopic: ${topic}\nInvite: ${email}`
    );
    setShowForm(false);
  };

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
                <option key={c.id} value={c.id}>
                  {c.name}
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
              {course &&
                topics[course]?.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </select>
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
              <th className="text-left py-2">Player</th>
              <th className="text-left py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {scoreBoard.map((entry, idx) => (
              <tr key={idx}>
                <td className="py-1">{entry.name}</td>
                <td className="py-1">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QuizGame;