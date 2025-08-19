import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./QuizPage.css";

function QuizPage() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isPractice = location.pathname.startsWith("/practicequiz");

  // Function to shuffle array
  const shuffleArray = (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {

    setLoading(true);
    const endpoint = isPractice
      ? `http://localhost:5000/api/practice/topics/${quizId}/practicequestions`
      : `http://localhost:5000/api/topics/${quizId}/questions`;

    axios
      .get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const shuffled = shuffleArray(res.data).slice(0, 10); // take only 10 shuffled questions
        setQuestions(shuffled);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load questions. Please try again later.");
        setLoading(false);
      });

    // Fetch remaining attempts for quiz
    if (!isPractice) {
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (userId) {
        axios
          .get(
            `http://localhost:5000/api/attempts/remaining/${userId}/${quizId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => setRemainingAttempts(res.data.remaining))
          .catch(() => setRemainingAttempts(null));
      }
    }
    // eslint-disable-next-line
  }, [quizId, location.pathname]);

  const handleAnswer = (qid, opt) => {
    setAnswers({ ...answers, [qid]: opt });
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const handleSubmit = async () => {
    const isAllAnswered = questions.every((q) => answers[q.id]);
    if (!isAllAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let scoreVal = 0;
    const answerArr = questions.map((q) => {
      const selected = answers[q.id];
      const correct = selected === q.correct_option;
      if (correct) scoreVal++;
      return {
        question_id: q.id,
        selected_option: selected,
        is_correct: correct,
      };
    });

    setScore(scoreVal);

    if (isPractice) {
      setSubmitted(true);
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/attempts/submit",
        {
          topicId: quizId,
          answers: answerArr,
          score: scoreVal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      // Refetch remaining attempts
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (userId) {
        axios
          .get(
            `http://localhost:5000/api/attempts/remaining/${userId}/${quizId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .then((res) => setRemainingAttempts(res.data.remaining))
          .catch(() => {});
      }
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Failed to submit quiz. Maybe you reached max attempts."
      );
      setSubmitted(false);
      console.log({
        topicId: quizId,
        answers: answerArr,
        score: scoreVal,
      });
    }
  };

  if (loading) return <div className="text-center p-10">Shuffling questions...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;

  // Show result after submit
  if (submitted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="bg-white shadow-lg px-8 py-10 rounded-xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-indigo-700">
            {isPractice ? "Practice Quiz Submitted!" : "Quiz Submitted!"}
          </h2>
          <p className="text-lg mb-2">
            Your Score:{" "}
            <span className="font-bold text-green-700">
              {score}/{questions.length}
            </span>
          </p>
          {!isPractice && (
            <p className="text-md text-gray-700 mb-2">
              Remaining Attempts:{" "}
              <span className="font-bold text-indigo-700">
                {remainingAttempts}
              </span>
            </p>
          )}
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
  const isAllAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="flex w-full max-w-6xl">
        {/* Left Sidebar */}
        <div className="bg-indigo-100 rounded-l-xl p-8 flex flex-col items-center justify-center w-1/4">
          <div className="text-xl font-bold text-indigo-700 mb-2">Question</div>
          <div className="text-4xl font-extrabold text-indigo-600">
            {current + 1}
          </div>
          <div className="text-lg text-indigo-500 mt-2">
            of {questions.length}
          </div>
          {/* Progress Bar */}
          <div className="w-full mt-6 h-2 bg-indigo-300 rounded">
            <div
              className="h-2 bg-indigo-700 rounded"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg px-8 py-10 w-2/4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
            Quiz
          </h2>
          {!isPractice && (
            <div className="mb-4 text-md text-gray-700">
              Remaining Attempts:{" "}
              <span className="font-bold text-indigo-700">
                {remainingAttempts !== null ? remainingAttempts : "Loading..."}
              </span>
            </div>
          )}
          <div className="mb-8 p-6 rounded-lg bg-indigo-50 shadow">
            <p className="font-semibold text-lg mb-4 text-indigo-800">
              {q.question_text}
            </p>
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

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={current === 0}
              className={`px-6 py-3 rounded-lg bg-gray-300 text-black font-semibold hover:bg-gray-400 transition ${
                current === 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>

            {current < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!answers[q.id]}
                className={`px-6 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition ${
                  !answers[q.id] ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!answers[q.id] || !isAllAnswered}
                className={`px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition 
                  ${
                    !answers[q.id] || !isAllAnswered
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {/* Right Sidebar for Question Navigation */}
        <div className="bg-indigo-50 rounded-r-xl p-6 w-1/4 flex flex-col items-center justify-start">
          <h3 className="text-indigo-700 text-lg font-bold mb-4">Questions</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((qItem, index) => {
              const isCurrent = current === index;
              const isAnswered = answers[qItem.id];

              let bgColor = "bg-gray-200 text-gray-700";
              if (isCurrent || isAnswered) bgColor = "bg-blue-500 text-white";

              return (
                <div
                  key={qItem.id}
                  className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold cursor-pointer ${bgColor}`}
                  onClick={() => setCurrent(index)}
                >
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
