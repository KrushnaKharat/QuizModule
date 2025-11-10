import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Loader from "./Loader";

function QuizPage() {
  const [topicTitle, setTopicTitle] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [timer, setTimer] = useState(null); // in seconds
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [maxAttempts, setMaxAttempts] = useState(3);
  const [resultCurrent, setResultCurrent] = useState(0);

  const answersRef = useRef({});
  const submitOnceRef = useRef(false); // <--- Prevent double submit

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

  // Fetch questions
  useEffect(() => {
    setLoading(true);

    const endpoint = isPractice
      ? `https://quizmodule.onrender.com/api/practice/topics/${quizId}/practicequestions`
      : `https://quizmodule.onrender.com/api/topics/${quizId}/questions`;
    axios
      .get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Shuffle and select 10 questions
        const shuffled = res.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffled.slice(0, 20));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load questions. Please try again later.");
        setLoading(false);
      });

    // Fetch remaining attempts for quiz
    if (!isPractice) {
      axios
        .get("https://quizmodule.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const userId = res.data.id;
          axios
            .get(
              `https://quizmodule.onrender.com/api/attempts/remaining/${userId}/${quizId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => {
              setRemainingAttempts(res.data.remaining);
              setMaxAttempts(res.data.maxAttempts || 3);
            })
            .catch(() => {
              setRemainingAttempts(null);
              setMaxAttempts(3);
            });
        });
    }
    // eslint-disable-next-line
  }, [quizId, location.pathname]);

  // Fetch topic timer
  useEffect(() => {
    axios
      .get(`https://quizmodule.onrender.com/api/course/topic/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Assume res.data.timer is in minutes, convert to seconds
        setTopicTitle(res.data.title || "");
        setTimer(res.data.timer * 60);
        setTimeLeft(res.data.timer * 60);
      })
      .catch(() => {
        setTopicTitle("");
        setTimer(10 * 60); // fallback 10 min
        setTimeLeft(10 * 60);
      });
  }, [quizId, token]);

  // Keep answersRef in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Timer effect
  useEffect(() => {
    if (!showInstructions && timer && !submitted && !isSubmitting) {
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
    // eslint-disable-next-line
  }, [showInstructions, timer, submitted, isSubmitting]);

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

  // Tab change/minimize/back: auto-submit with alert. Refresh: allowed.
  useEffect(() => {
    if (showInstructions || submitted || isSubmitting) return;

    // Handler for tab change or window blur
    const handleVisibility = () => {
      if (
        document.visibilityState === "hidden" &&
        !submitted &&
        !isSubmitting
      ) {
        alert(
          "You changed the tab. Your quiz will be submitted automatically."
        );
        handleSubmit();
      }
    };

    // Handler for browser back (optional)
    const handlePopState = (e) => {
      if (!submitted && !isSubmitting) {
        window.history.pushState(null, "", window.location.href);
        handleSubmit();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showInstructions, submitted, isSubmitting]);

  const handleSubmit = async () => {
    if (submitted || isSubmitting || submitOnceRef.current) return; // Prevent double submit
    setIsSubmitting(true);
    submitOnceRef.current = true;

    // Calculate score: only correct selected options
    let scoreVal = 0;
    const answerArr = questions.map((q) => {
      const selected = answersRef.current[q.id];
      const correct = selected && selected === q.correct_option;
      if (correct) scoreVal++;
      return {
        question_id: q.id,
        selected_option: selected || null,
        is_correct: !!correct,
      };
    });

    setScore(scoreVal);

    if (isPractice) {
      setSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(
        "https://quizmodule.onrender.com/api/attempts/submit",
        {
          topicId: quizId,
          answers: answerArr,
          score: scoreVal,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      // Refetch remaining attempts
      axios
        .get("https://quizmodule.onrender.com/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const userId = res.data.id;
          axios
            .get(
              `https://quizmodule.onrender.com/api/attempts/remaining/${userId}/${quizId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .then((res) => setRemainingAttempts(res.data.remaining))
            .catch(() => setRemainingAttempts(null));
        });
    } catch (err) {
      alert(
        err.response?.data?.msg ||
          "Failed to submit quiz. Maybe you reached max attempts."
      );
      setSubmitted(false);
    }
    setIsSubmitting(false);
  };

  if (loading) return <Loader text="Loading quiz..." />;
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;

  // Show instructions popup before quiz starts
  if (showInstructions) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 w-full">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-8 w-full max-w-md mx-2 text-center">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">
            Quiz Instructions
          </h2>
          <ul className="text-left mb-6 list-disc list-inside text-gray-700 text-sm sm:text-base">
            <b>
              <li>Answer all questions within the time limit.</li>
              <li>Once you start, the timer will not pause.</li>
              <li>You cannot retake the quiz after max attempts.</li>
              <li>Quiz will auto-submit when time is up.</li>
              <li>Answer all questions before submitting.</li>
              <li>
                You have {Math.floor((timer || 600) / 60)} minutes to complete
                the quiz.
              </li>
              <li>
                You have a maximum of {maxAttempts} attempts for this quiz.
              </li>
            </b>
            <li>
              <b className="text-red-700">
                Do not change tab, minimize, or leave this page during the quiz.{" "}
                If you do, your quiz will be submitted automatically.
              </b>
            </li>
            <li>
              <b className="text-red-700">
                Do not use the browser back button during the quiz. This will
                also submit your quiz automatically.
              </b>
            </li>
          </ul>
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            onClick={() => setShowInstructions(false)}
          >
            I Understand
          </button>
        </div>
      </div>
    );
  }

  // Show result after submit
  if (submitted) {
    // Prepare result data
    const resultData = questions.map((q) => {
      const selected = answers[q.id];
      const isCorrect = selected === q.correct_option;
      return {
        question_text: q.question_text,
        options: ["A", "B", "C", "D"].map((opt) => ({
          key: opt,
          value: q[`option_${opt.toLowerCase()}`],
        })),
        selected,
        correct_option: q.correct_option,
        isCorrect,
      };
    });

    const currentResult = resultData[resultCurrent];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-1 sm:px-0">
        <div className="flex flex-col justify-center items-center w-full max-w-6xl">
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
                {remainingAttempts !== null ? remainingAttempts : "Loading..."}/
                {maxAttempts}
              </span>
            </p>
          )}
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
            onClick={() => window.open("https://appliedinsights.in/", "_blank")}
          >
            Visit Our Website
          </button>
        </div>

        {/* Result Card for Each Question */}
        <div className="bg-white shadow-lg rounded-xl px-8 py-8 w-full max-w-xl flex flex-col items-center mt-4">
          <div className="mb-4 w-full">
            <div className="text-lg font-semibold text-indigo-700 mb-2">
              Question {resultCurrent + 1} of {questions.length}
            </div>
            <div className="text-md font-bold mb-4 text-gray-800">
              {currentResult.question_text}
            </div>
            <div className="flex flex-col gap-2 mb-4">
              {currentResult.options.map((opt) => {
                const isSelected = currentResult.selected === opt.key;
                const isCorrect = currentResult.correct_option === opt.key;
                return (
                  <div
                    key={opt.key}
                    className={`flex items-center gap-2 px-3 py-2 rounded border
        ${
          isSelected
            ? isCorrect
              ? "bg-green-100 border-green-400"
              : "bg-red-100 border-red-400"
            : "bg-gray-50 border-gray-200"
        }
      `}
                  >
                    <span
                      className={`font-bold ${
                        isSelected
                          ? isCorrect
                            ? "text-green-700"
                            : "text-red-700"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.key}.
                    </span>
                    <span
                      className={`${
                        isSelected
                          ? isCorrect
                            ? "text-green-700"
                            : "text-red-700"
                          : "text-gray-700"
                      }`}
                    >
                      {opt.value}
                    </span>
                    {isSelected && (
                      <span
                        className="ml-2 px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          background: isCorrect ? "#bbf7d0" : "#fecaca",
                          color: isCorrect ? "#166534" : "#991b1b",
                        }}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </span>
                    )}
                    {isCorrect && !isSelected && (
                      <span className="ml-2 px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
                        Correct Answer
                      </span>
                    )}
                  </div>
                );
              })}
              {!currentResult.selected && (
                <div className="text-red-600 font-semibold mt-2">
                  Not Answered
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between w-full mt-2">
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              disabled={resultCurrent === 0}
              onClick={() => setResultCurrent((prev) => prev - 1)}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              disabled={resultCurrent === questions.length - 1}
              onClick={() => setResultCurrent((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && !isPractice && remainingAttempts === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
        <div className="bg-white shadow-lg rounded-xl px-8 py-10 w-full max-w-md flex flex-col items-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            No Attempts Left
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            You have used all your attempts for this quiz topic.
          </p>
          <button
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
          <button
            className="mt-2 px-5 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-bold shadow hover:scale-105 hover:from-blue-600 hover:to-indigo-700 transition"
            onClick={() => window.open("https://appliedinsights.in/", "_blank")}
          >
            Visit Our Website
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const isAllAnswered =
    questions.length > 0 && questions.every((q) => answers[q.id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200 px-1 sm:px-0">
      <div className="flex flex-col md:flex-row w-full max-w-6xl">
        {/* Left Sidebar */}
        <div className="bg-indigo-100 rounded-t-xl md:rounded-l-xl md:rounded-tr-none p-4 sm:p-8 flex flex-col items-center justify-center w-full md:w-1/4">
          <div className="w-full flex flex-col items-center justify-center mb-4">
            {topicTitle && (
              <div className="text-xl font-bold text-indigo-700 mb-2 flex flex-col justify-center items-center">
                <span>Topic : </span> <span> {topicTitle}</span>
              </div>
            )}
          </div>
          <div className="w-full flex flex-col items-center justify-between">
            <div className="text-xl font-bold text-indigo-700 mb-2">
              Question
            </div>
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
                style={{
                  width: `${((current + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-lg px-2 sm:px-8 py-6 sm:py-10 w-full md:w-2/4">
          <h2 className="text-3xl font-bold text-center mb-8 text-indigo-700">
            Quiz
          </h2>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <div>
              {!isPractice && (
                <span className="text-md text-gray-700">
                  Remaining Attempts:{" "}
                  <span className="font-bold text-indigo-700">
                    {remainingAttempts !== null
                      ? remainingAttempts
                      : "Loading..."}
                    /{maxAttempts}
                  </span>
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-red-600">
              Time Left:{" "}
              {timeLeft !== null
                ? `${Math.floor(timeLeft / 60)}:${String(
                    timeLeft % 60
                  ).padStart(2, "0")}`
                : "--:--"}
            </div>
          </div>
          <div className="mb-8 p-4 sm:p-6 rounded-lg bg-indigo-50 shadow">
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
          <div className="flex flex-col sm:flex-row justify-between gap-2">
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
        <div className="bg-indigo-50 rounded-b-xl md:rounded-r-xl md:rounded-bl-none p-4 sm:p-6 w-full md:w-1/4 flex flex-col items-center justify-between">
          <div>
            <h3 className="text-indigo-700 text-lg text-center font-bold mb-4">
              Questions
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((qItem, index) => {
                const isCurrent = current === index;
                const isAnswered = answers[qItem.id];
                const isSkipped = index < current && !isAnswered;

                let bgColor = "bg-gray-200 text-gray-700";
                if (isCurrent) bgColor = "bg-blue-500 text-white";
                else if (isAnswered) bgColor = "bg-green-500 text-white";
                else if (isSkipped) bgColor = "bg-red-500 text-white";

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

          <div className="flex flex-col items-center p-2 rounded-sm gap-2">
            <img
              className="h-24 w-fit object-contain rounded-full shadow-md shadow-indigo-500"
              src="/pictures/logo.png"
              alt="Company Logo"
            />
            <span className=" text-lg text-indigo-800 font-bold  ">
              Applied InSights
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
