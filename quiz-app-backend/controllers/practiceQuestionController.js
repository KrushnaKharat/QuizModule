const pool = require("../config/db");

exports.getPracticeQuestionsByTopicId = async (req, res) => {
  const { topicId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM practicequestions WHERE topic_id = $1",
      [topicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.addPracticeQuestionsToTopic = async (req, res) => {
  const { topicId } = req.params;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;

  try {
    await pool.query(
      "INSERT INTO practicequestions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        topicId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
      ]
    );
    res.json({ msg: "Question added" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deletePracticeQuestions = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM practicequestions WHERE id = $1", [id]);
    res.json({ msg: "Question deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updatePracticeQuestions = async (req, res) => {
  const id = req.params.id;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;
  try {
    await pool.query(
      `UPDATE practicequestions SET question_text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_option=$6 WHERE id=$7`,
      [
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        id,
      ]
    );
    res.json({ message: "Question updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.importPracticeQuestionsFromFile = async (req, res) => {
  const { topicId } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const ext = file.originalname.split(".").pop().toLowerCase();

  let questions = [];

  const insertQuestions = async () => {
    if (questions.length === 0)
      return res.status(400).json({ error: "No questions found in file" });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const q of questions) {
        await client.query(
          "INSERT INTO practicequestions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            topicId,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option,
          ]
        );
      }
      await client.query("COMMIT");
      fs.unlinkSync(file.path);
      res.json({ msg: "Questions imported", count: questions.length });
    } catch (err) {
      await client.query("ROLLBACK");
      fs.unlinkSync(file.path);
      res.status(500).json(err);
    } finally {
      client.release();
    }
  };

  if (ext === "csv") {
    fs.createReadStream(file.path)
      .pipe(csv())
      .on("data", (row) => {
        questions.push({
          question_text: row.question_text,
          option_a: row.option_a,
          option_b: row.option_b,
          option_c: row.option_c,
          option_d: row.option_d,
          correct_option: row.correct_option,
        });
      })
      .on("end", insertQuestions);
  } else if (ext === "xlsx" || ext === "xls") {
    const workbook = xlsx.readFile(file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);
    questions = rows.map((row) => ({
      question_text: row.question_text,
      option_a: row.option_a,
      option_b: row.option_b,
      option_c: row.option_c,
      option_d: row.option_d,
      correct_option: row.correct_option,
    }));
    insertQuestions();
  } else {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Unsupported file type" });
  }
};
