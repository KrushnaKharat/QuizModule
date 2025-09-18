const express = require("express");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/authRoutes");
const quizRoutes = require("./routes/quizRoutes");
const questionRoutes = require("./routes/questionRoutes");
const topicRoutes = require("./routes/topicRoutes");
const practiceQuestionRoutes = require("./routes/practiceQuestionRoutes");
const attemptRoutes = require("./routes/attemptRoutes");
const groupQuizRoutes = require("./routes/groupQuizRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", quizRoutes);
app.use("/api", questionRoutes);
app.use("/api/practice", practiceQuestionRoutes);
app.use("/api/course", topicRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/groupquiz", groupQuizRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
