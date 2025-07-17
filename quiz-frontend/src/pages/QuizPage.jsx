import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function QuizPage() {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/questions/${quizId}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setQuestions(res.data));
  }, [quizId]);

  const handleAnswer = (qid, opt) => {
    setAnswers({ ...answers, [qid]: opt });
  };

  const handleSubmit = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correct_option) score++;
    });
    alert(`You scored ${score}/${questions.length}`);
  };

  return (
    <div>
      <h2>Quiz</h2>
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question_text}</p>
          {['A', 'B', 'C', 'D'].map(opt => (
            <label key={opt}>
              <input
                type='radio'
                name={`q-${q.id}`}
                value={opt}
                onChange={() => handleAnswer(q.id, opt)}
              /> {q[`option_${opt.toLowerCase()}`]}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit Quiz</button>
    </div>
  );
}

export default QuizPage;