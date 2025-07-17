import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminPanel() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({});
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', time_limit: 10 });

  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get('http://localhost:5000/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setQuizzes(res.data));
  }, []);

  const loadQuestions = async (id) => {
    setQuizId(id);
    const res = await axios.get(`http://localhost:5000/api/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setQuestions(res.data);
  };

  const addQuiz = async () => {
    await axios.post('http://localhost:5000/api/quizzes', newQuiz, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const res = await axios.get('http://localhost:5000/api/quizzes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setQuizzes(res.data);
  };

  const addQuestion = async () => {
    await axios.post('http://localhost:5000/api/questions', { ...newQuestion, quiz_id: quizId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    loadQuestions(quizId);
  };

  const deleteQuestion = async (id) => {
    await axios.delete(`http://localhost:5000/api/questions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
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
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-indigo-700'>Admin Panel</h2>
        <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className='bg-red-500 text-white px-4 py-2 rounded'>Logout</button>
      </div>

      <div className='bg-white rounded p-6 shadow mb-8'>
        <h3 className='text-xl font-semibold mb-4'>Add New Quiz</h3>
        <div className='flex flex-col md:flex-row gap-4'>
          <input className='border p-2 rounded w-full' placeholder='Title' onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })} />
          <input className='border p-2 rounded w-full' placeholder='Description' onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })} />
          <input type='number' className='border p-2 rounded w-full' placeholder='Time Limit (min)' onChange={(e) => setNewQuiz({ ...newQuiz, time_limit: e.target.value })} />
          <button className='bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700' onClick={addQuiz}>Add</button>
        </div>
      </div>

      <div className='grid md:grid-cols-3 gap-4 mb-8'>
        {quizzes.map(q => (
          <div key={q.id} onClick={() => loadQuestions(q.id)} className='cursor-pointer bg-white p-4 rounded shadow hover:bg-indigo-100 transition'>
            <h3 className='font-semibold'>{q.title}</h3>
            <p className='text-sm text-gray-600'>{q.description}</p>
          </div>
        ))}
      </div>

      {quizId && (
        <div className='bg-white rounded p-6 shadow'>
          <h3 className='text-xl font-semibold mb-4'>Manage Questions</h3>
          <div className='space-y-3'>
            {questions.map(q => (
              <div key={q.id} className='p-3 border rounded'>
                <input defaultValue={q.question_text} onChange={(e) => q.question_text = e.target.value} className='border w-full p-2 mb-2 rounded' />
                <div className='flex justify-between'>
                  <button onClick={() => updateQuestion(q)} className='bg-green-500 text-white px-3 py-1 rounded'>Update</button>
                  <button onClick={() => deleteQuestion(q.id)} className='bg-red-500 text-white px-3 py-1 rounded'>Delete</button>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-6'>
            <h4 className='font-semibold mb-2'>Add New Question</h4>
            <div className='grid md:grid-cols-2 gap-4'>
              <input className='border p-2 rounded' placeholder='Question text' onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })} />
              <input className='border p-2 rounded' placeholder='Option A' onChange={(e) => setNewQuestion({ ...newQuestion, option_a: e.target.value })} />
              <input className='border p-2 rounded' placeholder='Option B' onChange={(e) => setNewQuestion({ ...newQuestion, option_b: e.target.value })} />
              <input className='border p-2 rounded' placeholder='Option C' onChange={(e) => setNewQuestion({ ...newQuestion, option_c: e.target.value })} />
              <input className='border p-2 rounded' placeholder='Option D' onChange={(e) => setNewQuestion({ ...newQuestion, option_d: e.target.value })} />
              <input className='border p-2 rounded' placeholder='Correct Option (A/B/C/D)' onChange={(e) => setNewQuestion({ ...newQuestion, correct_option: e.target.value })} />
            </div>
            <button className='mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700' onClick={addQuestion}>Add Question</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
