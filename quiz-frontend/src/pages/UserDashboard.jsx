import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizzes(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch quizzes.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Emoji array for unique icons
  const quizEmojis = ['🧠', '📘', '🎲', '🎯', '📝', '📚', '💡', '🚀', '🔬', '🎵'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-indigo-700">🎯 Your Quizzes</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-blue-700 text-lg">Loading quizzes...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : quizzes.length === 0 ? (
        <p className="text-gray-600">No quizzes found. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz, index) => (
            <div
              key={quiz.id}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="group cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transform transition duration-300 p-6"
              style={{
                animation: 'fadeInUp 0.7s cubic-bezier(.21,.61,.35,1) forwards',
                animationDelay: `${index * 120}ms`,
                opacity: 0
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-indigo-700">{quiz.title}</h2>
                <span className="text-3xl">{quizEmojis[index % quizEmojis.length]}</span>
              </div>
              <p className="text-gray-600 text-sm">{quiz.description}</p>
              <div className="mt-4 text-sm text-indigo-600 font-medium underline opacity-0 group-hover:opacity-100 transition">
                Start Quiz →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserDashboard;