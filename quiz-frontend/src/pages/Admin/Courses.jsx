import React, { useEffect, useState } from "react";
import axios from "axios";

function Courses({ onEditTopics }) {
  const [course, setCourse] = useState([]);
  const [quizzesId, getQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({});

  const [viewTopicsCourseId, setViewTopicsCourseId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [editTopicId, setEditTopicId] = useState(null);
  const [editTopicTitle, setEditTopicTitle] = useState("");

  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [newTopic, setNewTopic] = useState({
    title: "",
  });

  const [newCourse, setNewCourse] = useState({
    title: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/courses", {
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
      await axios.post("http://localhost:5000/api/courses", newCourse, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const res = await axios.get("http://localhost:5000/api/courses", {
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
    try {
      await axios.post(
        `http://localhost:5000/api/course/${selectedCourseId}/topics`,
        { title: newTopic.title },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewTopic({ title: "" });

      setSelectedCourseId(null);
      fetchTopics(selectedCourseId);

      // Optionally reload courses/topics here
    } catch (err) {
      alert("Failed to add topic");
      console.log(err);
    }
  };

  const fetchTopics = async (courseId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/course/${courseId}/topics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTopics(res.data);
      setViewTopicsCourseId(courseId);
    } catch (err) {
      alert("Failed to fetch topics");
    }
  };

  const handleEditTopic = async (topicId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/course/${viewTopicsCourseId}/topics/${topicId}`,
        { title: editTopicTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTopics(viewTopicsCourseId);
      setEditTopicId(null);
      setEditTopicTitle("");
    } catch (err) {
      alert("Failed to edit topic");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/course/${viewTopicsCourseId}/topics/${topicId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTopics(viewTopicsCourseId);
    } catch (err) {
      alert("Failed to delete topic");
    }
  };

  const deleteTopic = async (id) => {
    await axios.delete(`http://localhost:5000/api/courses/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const res = await axios.get("http://localhost:5000/api/courses", {
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
    <div className="min-h-screen w-screen flex flex-col bg-gray-50 overflow-hidden">
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

      <div className=" grid grid-cols-3 w-3/4 gap-2">
        {course.map((q) => (
          <div key={q.id} className="bg-white rounded shadow  ">
            <div className="flex hover:bg-indigo-100 justify-between transition w-full p-2 ">
              <div className="font-semibold text-xl">{q.title}</div>
              <div className="flex flex-col gap-2 justify-between h-full">
                {/* <button
                  onClick={() => setSelectedCourseId(q.id)}
                  className="rounded rounded-md text-white cursor-pointer bg-sky-500 p-2"
                >
                  Add Topics
                </button> */}
                <button
                  className="rounded rounded-md text-white cursor-pointer bg-sky-500 p-2"
                  onClick={() => onEditTopics(q.id)}
                >
                  Edit Topics
                </button>
                <button
                  className="btn text-white bg-red-500 cursor-pointer rounded rounded-md p-2 "
                  onClick={() => deleteTopic(q.id)}
                >
                  Delete Course
                </button>
              </div>
            </div>
            <div className="w-full">
              {selectedCourseId === q.id && (
                <div className="bg-white block rounded p-6 shadow mt-4">
                  <h3 className="text-xl font-semibold mb-4">
                    Add Topics for {q.title}
                  </h3>
                  <input
                    className="border p-2 rounded"
                    placeholder="Topic"
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                  />
                  <button
                    className="btn bg-purple-400 p-2 ml-2"
                    onClick={addTopic}
                  >
                    Add Topic
                  </button>
                </div>
              )}
              {/* Topics List */}
              {/* {viewTopicsCourseId === q.id && (
                <div className="bg-gray-50 rounded p-4 mt-4 w-full">
                  <h4 className="font-semibold mb-2">Topics</h4>
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
                              onChange={(e) =>
                                setEditTopicTitle(e.target.value)
                              }
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
                            <span>{topic.title}</span>
                            <div>
                              <button
                                className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                                onClick={() => {
                                  setEditTopicId(topic.id);
                                  setEditTopicTitle(topic.title);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="bg-red-500 text-white px-2 py-1 rounded"
                                onClick={() => handleDeleteTopic(topic.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )} */}
            </div>
          </div>
        ))}
      </div>

      {/* {quizId && (
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
      )} */}
    </div>
  );
}

export default Courses;
