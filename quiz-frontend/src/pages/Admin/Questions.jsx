import React, { useEffect, useState } from "react";
import axios from "axios";
// "csv" or "excel"

function Questions({ topicId, token, onBack, type = "questions" }) {
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState("");
  const handleImport = async () => {
    if (!importFile || !importType) return;
    const formData = new FormData();
    formData.append("file", importFile);

    try {
      await axios.post(
        `http://localhost:5000/api/topics/${topicId}/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setImportFile(null);
      setImportType("");
      fetchQuestions();
      alert("Questions imported successfully");
    } catch (err) {
      alert("Failed to import questions");
    }
  };

  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "",
  });

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [topicId, type]);

  const fetchQuestions = async () => {
    try {
      const url =
        type === "practicequestions"
          ? `http://localhost:5000/api/practice/topics/${topicId}/practicequestions`
          : `http://localhost:5000/api/topics/${topicId}/questions`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(res.data);
    } catch (err) {
      alert("Failed to fetch questions");
    }
    
  };

  const handleAddQuestion = async () => {
    try {
      const url =
        type === "practicequestions"
          ? `http://localhost:5000/api/practice/topics/${topicId}/practicequestions`
          : `http://localhost:5000/api/topics/${topicId}/questions`;
      await axios.post(url, newQuestion, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewQuestion({
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "",
      });
      fetchQuestions();
    } catch (err) {
      alert("Failed to add question");
    }
  };

  return (
    <div className="bg-white rounded shadow p-6 flex flex-col gap-2">
      <button className="mb-4 text-blue-600 underline" onClick={onBack}>
        &larr; Back to Topics
      </button>
      <h3 className="text-xl font-semibold mb-4">Questions   </h3>
      <input
        className="border p-2 rounded w-full"
        placeholder="Question text"
        value={newQuestion.question_text}
        onChange={(e) =>
          setNewQuestion({ ...newQuestion, question_text: e.target.value })
        }
      />
      <div className="mb-4 grid md:grid-cols-2 gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Option A"
          value={newQuestion.option_a}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, option_a: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Option B"
          value={newQuestion.option_b}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, option_b: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Option C"
          value={newQuestion.option_c}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, option_c: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Option D"
          value={newQuestion.option_d}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, option_d: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Correct Option (A/B/C/D)"
          value={newQuestion.correct_option}
          onChange={(e) =>
            setNewQuestion({ ...newQuestion, correct_option: e.target.value })
          }
        />
      </div>
      <div className="mb-3">
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={handleAddQuestion}
        >
          Add Question
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <label htmlFor="importFile">Upload CSV or Excel File</label>
        <div className="flex gap-2">
          <input
            id="importFile"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              setImportFile(e.target.files[0]);
              // Set importType based on file extension
              const ext = e.target.files[0]?.name.split(".").pop();
              if (ext === "csv") setImportType("csv");
              else if (ext === "xlsx" || ext === "xls") setImportType("excel");
              else setImportType("");
            }}
          />
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleImport}
            disabled={!importFile || !importType}
          >
            Import
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Questions List</h4>
        {questions.length === 0 ? (
          <div className="text-gray-500">No questions found.</div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="p-3 border rounded mb-2">
              <div className="font-semibold">{q.question_text}</div>
              <div className="text-sm">
                A: {q.option_a} | B: {q.option_b} | C: {q.option_c} | D:{" "}
                {q.option_d}
              </div>
              <div className="text-xs text-green-700">
                Correct: {q.correct_option}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Questions;
