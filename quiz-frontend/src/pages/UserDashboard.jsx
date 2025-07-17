import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(res.data);
    };
    fetchQuizzes();
  }, []);

  return (
    <div className='min-h-screen bg-blue-50 p-8'>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-3xl font-bold text-blue-800'>Available Quizzes</h2>
        <button onClick={() => { localStorage.clear(); navigate('/'); }} className='bg-red-500 text-white px-4 py-2 rounded'>Logout</button>
      </div>
      <div className='grid md:grid-cols-3 gap-4'>
        {quizzes.map(q => (
          <div key={q.id} onClick={() => navigate(`/quiz/${q.id}`)} className='cursor-pointer bg-white p-4 rounded shadow hover:bg-blue-100 transition'>
            <h3 className='font-semibold'>{q.title}</h3>
            <p className='text-sm text-gray-600'>{q.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserDashboard;