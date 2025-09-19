import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import QuizPage from "./pages/QuizPage";
import QuizGame from "./pages/online-quiz/QuizGame";
import Lobby from "./pages/online-quiz/Lobby";
import GroupQuiz from "./pages/online-quiz/GroupQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/practicequiz/:quizId" element={<QuizPage />} />
        <Route path="/quizgame" element={<QuizGame />} />
        <Route path="/lobby/:session_id" element={<Lobby />} />
        <Route path="/groupquiz/:session_id" element={<GroupQuiz />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
