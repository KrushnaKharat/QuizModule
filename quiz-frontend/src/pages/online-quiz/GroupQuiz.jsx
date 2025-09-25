import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const GroupQuiz = () => {
  const { session_id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [timer, setTimer] = useState(null); // in seconds
  const [timeLeft, setTimeLeft] = useState(null);

  const [allResults, setAllResults] = useState([]);

  // Fetch locked questions for this session
  const fetchResults = useCallback(() => {
    axios
      .get(
        `https://quizmodule.onrender.com/api/groupquiz/results/${session_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setAllResults(res.data));
  }, [session_id, token]);

  useEffect(() => {
    if (submitted) {
      fetchResults();
      const interval = setInterval(fetchResults, 3000); // Poll every 3s
      return () => clearInterval(interval);
    }
  }, [submitted, fetchResults]);

  useEffect(() => {
    setLoading(true);
    axios
      .get(
        `https://quizmodule.onrender.com/api/groupquiz/questions/${session_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        setQuestions(res.data);
        setLoading(false);
      });
    axios
      .get("https://quizmodule.onrender.com/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUser(res.data))
      .catch(() => setLoading(false));
  }, [session_id, token]);

  const handleAnswer = (qid, opt) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const handleSubmit = async () => {
    let sc = 0;
    questions.forEach((q) => {
      if (answers[q.id] && answers[q.id] === q.correct_option) sc += 1;
    });
    setScore(sc);
    setSubmitted(true);

    // Submit result to backend
    await axios.post(
      "https://quizmodule.onrender.com/api/groupquiz/result",
      {
        session_id: session_id,
        user_id: user.id,
        score: sc,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setResult({ score: sc, total: questions.length });
  };

  // Fetch timer from backend
  useEffect(() => {
    axios
      .get(`https://quizmodule.onrender.com/api/groupquiz/sessioninfo/${session_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTimer(res.data.timer * 60); // convert minutes to seconds
        setTimeLeft(res.data.timer * 60);
      });
  }, [session_id, token]);

  // Timer effect
  useEffect(() => {
    if (timer && !submitted && questions.length > 0) {
      setTimeLeft(timer);
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmit(); // auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer, submitted, questions.length]);

  if (loading) return <div className="p-8 text-lg">Loading quiz...</div>;

  if (submitted)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-2 sm:px-0">
        <div className="bg-white shadow-lg rounded-xl px-2 sm:px-8 py-4 sm:py-8 w-full max-w-xl flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-700">
            Group Quiz Submitted!
          </h2>
          <p className="text-lg mb-2">
            Your Score:{" "}
            <span className="font-bold text-green-700">
              {result?.score}/{result?.total}
            </span>
          </p>
          <h3 className="text-xl font-bold mt-6 mb-2 text-indigo-700">
            All Participants' Results
          </h3>
          <table className="w-full text-left mb-4">
            <thead>
              <tr>
                <th className="py-1 px-2">Name</th>
                <th className="py-1 px-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((r) => (
                <tr key={r.user_id}>
                  <td className="py-1 px-2">{r.name}</td>
                  <td className="py-1 px-2">{r.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  const q = questions[current];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-1 sm:px-0">
      <div className="bg-white shadow-lg px-2 sm:px-8 py-6 sm:py-10 w-full max-w-2xl rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-8 text-indigo-700">
          Group Quiz
        </h2>
        <div className="flex justify-end mb-4">
          <div className="text-lg font-bold text-red-600">
            Time Left:{" "}
            {timeLeft !== null
              ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(
                  2,
                  "0"
                )}`
              : "--:--"}
          </div>
        </div>
        <div className="mb-8 p-6 rounded-lg bg-indigo-50 shadow">
          <div className="font-semibold text-lg mb-4 text-indigo-800">
            Q{current + 1}: {q.question_text}
          </div>
          <div className="flex flex-col gap-3">
            {["A", "B", "C", "D"].map((opt) => (
              <label
                key={opt}
                htmlFor={`opt-${q.id}-${opt}`}
                className={`flex items-center gap-2 cursor-pointer hover:bg-indigo-100 px-3 py-2 rounded transition
                  ${answers[q.id] === opt ? "bg-indigo-200" : ""}`}
              >
                <input
                  type="radio"
                  id={`opt-${q.id}-${opt}`}
                  name={`q-${q.id}`}
                  value={opt}
                  checked={answers[q.id] === opt}
                  onChange={() => handleAnswer(q.id, opt)}
                  className="accent-indigo-600"
                />
                <span className="text-indigo-700">
                  {q[`option_${opt.toLowerCase()}`]}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrent((prev) => prev - 1)}
            disabled={current === 0}
            className={`px-6 py-3 rounded-lg bg-gray-300 text-black font-semibold hover:bg-gray-400 transition ${current === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            Previous
          </button>
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent((prev) => prev + 1)}
              disabled={!answers[q.id]}
              className={`px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${!answers[q.id] ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== questions.length}
              className={`px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition 
                ${Object.keys(answers).length !== questions.length
                  ? "opacity-50 cursor-not-allowed"
                  : ""
                }`}
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupQuiz;