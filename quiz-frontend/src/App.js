import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/UserDashboard";
import AdminPanel from "./pages/AdminPanel";
import QuizPage from "./pages/QuizPage";
import QuizGame from "./pages/QuizGame";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
