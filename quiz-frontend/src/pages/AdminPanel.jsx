import React, { useEffect, useState } from "react";
import axios from "axios";

function AdminPanel() {
  const [course, setCourse] = useState([]);
  const [quizzesId, getQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({});

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [newTopic, setNewTopic] = useState("");

  const [newCourse, setNewCourse] = useState({
    title: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/course", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCourse(res.data));
  }, []);

  const loadQuestions = async (id) => {
    setQuizId(id);
    const res = await axios.get(`http://localhost:5000/api/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setQuestions(res.data);
  };

  // const addQuiz = async () => {
  //   await axios.post("http://localhost:5000/api/quizzes", newQuiz, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const res = await axios.get("http://localhost:5000/api/quizzes", {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });

  //   setQuizzes(res.data);
  // };
  const addCourse = async () => {
    // Trim and normalize title
    const trimmedTitle = newCourse.title.trim().toLowerCase();

    // Check if title already exists
    const isDuplicate = course.some(
      (course) => course.title.trim().toLowerCase() === trimmedTitle
    );

    if (isDuplicate) {
      alert("This course already exists!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/course", newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get("http://localhost:5000/api/course", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNewCourse({ title: "" }); // Clear form
      setCourse(res.data);
    } catch (err) {
      console.error("Error adding quiz:", err);
      alert("Failed to add quiz. Try again.");
    }
  };

  const addTopic = async () => {
    if (!newTopic.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/course/${selectedCourseId}/topics`,
        { description: newTopic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTopic("");
      setSelectedCourseId(null);
      // Optionally reload courses/topics here
    } catch (err) {
      alert("Failed to add topic");
    }
  };

  const deleteTopic = async (id) => {
    await axios.delete(`http://localhost:5000/api/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get("http://localhost:5000/api/course", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCourse(res.data);
  };

  const addQuestion = async () => {
    await axios.post(
      "http://localhost:5000/api/questions",
      { ...newQuestion, quiz_id: quizId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    loadQuestions(quizId);
  };

  const deleteQuestion = async (id) => {
    await axios.delete(`http://localhost:5000/api/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadQuestions(quizId);
  };

  const updateQuestion = async (q) => {
    await axios.put(`http://localhost:5000/api/questions/${q.id}`, q, {
      headers: { Authorization: `Bearer ${token}` },
    });
    loadQuestions(quizId);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-6">
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

      <div className="bg-red rounded p-6 shadow mb-8 flex justify-center flex-col w-full">
        <h3 className="text-xl font-semibold mb-4">Add New Courses</h3>
        <div className="flex flex-col md:flex-row gap-4 w-1/2">
          <input
            className="border p-2 rounded w-full"
            placeholder="Course"
            value={newCourse.title}
            onChange={(e) =>
              setNewCourse({ ...newCourse, title: e.target.value })
            }
          />
          {/* <input
            className="border p-2 rounded w-full"
            placeholder="Topic"
            onChange={(e) =>
              setNewQuiz({ ...newQuiz, description: e.target.value })
            }
          /> */}

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={addCourse}
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {course.map((q) => (
          <div
            key={q.id}
            className=" bg-white p-4 rounded shadow hover:bg-indigo-100 transition"
          >
            <h3 className="font-semibold text-xl">{q.title}</h3>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setSelectedCourseId(q.id)}
                className="rounded rounded-md text-white cursor-pointer bg-sky-500 p-2"
              >
                Add Topics
              </button>
              <button
                className="btn text-white bg-red-500 cursor-pointer rounded rounded-md p-2 "
                onClick={() => deleteTopic(q.id)}
              >
                Delete Course
              </button>
            </div>
            {/* <p className="text-sm text-gray-600">{q.description}</p> */}
          </div>
        ))}
      </div>

      <div>
        <div className="bg-white rounded p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Add Topics </h3>

          <input
            className="border p-2 rounded"
            placeholder="Topic"
            // onChange={}
          />
          <button
            className="btn bg-purple-400 p-2"
            onClick={(e) =>
              setNewCourse({ ...newCourse, description: e.target.value })
            }
          >
            Add Topic
          </button>
          {course.map}
        </div>
      </div>

      {quizId && (
        <div className="bg-white rounded p-6 shadow">
          <h3 className="text-xl font-semibold mb-4">Questions List</h3>
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="p-3 border rounded">
                <input
                  defaultValue={q.question_text}
                  onChange={(e) => (q.question_text = e.target.value)}
                  className="border w-full p-2 mb-2 rounded"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => updateQuestion(q)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => deleteQuestion(q.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Add New Question</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Question text"
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    question_text: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Option A"
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_a: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Option B"
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_b: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Option C"
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_c: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Option D"
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, option_d: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Correct Option (A/B/C/D)"
                onChange={(e) =>
                  setNewQuestion({
                    ...newQuestion,
                    correct_option: e.target.value,
                  })
                }
              />
            </div>
            <button
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
