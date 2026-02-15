import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash, FaCheckCircle } from "react-icons/fa";
import { createQuestion, fetchAllQuestions, deleteQuestion } from "./quizApi";
import "./Quiz.css";

const QuizAdmin = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizConfig, setQuizConfig] = useState({
    questionCount: 8,
    durationMs: 240000,
  });

  const [formData, setFormData] = useState({
    prompt: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correctIndex: 0,
    category: "Finance",
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAllQuestions();
      setQuestions(data.questions || []);
      if (data.config) {
        setQuizConfig(data.config);
      }
    } catch (err) {
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "correctIndex" ? parseInt(value, 10) : value,
    }));
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setError(""); } = formData;

    if (!prompt.trim() || !option1.trim() || !option2.trim() || !option3.trim() || !option4.trim()) {
      setError("All fields are required.");
      return;
    }

    try {
      await createQuestion({
        prompt: prompt.trim(),
        options: [option1.trim(), option2.trim(), option3.trim(), option4.trim()],
        correctIndex,
        category,
      });

      setSuccess("Question created successfully!");
      setFormData({
        prompt: "",
        option1: "",
        option2: "",
        option3: "",
        option4: "",
        correctIndex: 0,
        category: "Finance
        correctIndex: 0,
        category: "Finance",
        difficulty: "Medium",
      });

      loadQuestions();
    } catch (err) {
      setError(err.message || "Failed to create question.");
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;

    setError("");
    setSuccess("");
    try {
      await deleteQuestion(id);
      setSuccess("Question deleted.");
      loadQuestions();
    } catch (err) {
      setError(err.message || "Failed to delete question.");
    }
  };

  return (
    <div className="quiz-shell">
      <div className="quiz-container">
        <h1 className="quiz-title">Admin Panel</h1>
        <p className="quiz-subtitle">Create and manage quiz questions. All changes apply in real time.</p>

        <div className="quiz-card">
          <h2 style={{ color: "var(--quiz-gold-400)", marginBottom: "16px" }}>Create New Question</h2>
          <form onSubmit={handleCreateQuestion}>
            <div className="quiz-grid" style={{ marginBottom: "16px" }2px" }}>Quiz Settings</h2>
          <div className="quiz-grid" style={{ marginBottom: "16px" }}>
            <div>
              <p style={{ color: "var(--quiz-muted)", fontSize: "0.9rem", marginBottom: "6px" }}>Questions per Quiz</p>
              <p style={{ color: "var(--quiz-gold-400)", fontSize: "1.4rem", fontWeight: "600" }}>
                {quizConfig.questionCount}
              </p>
            </div>
            <div>
              <p style={{ color: "var(--quiz-muted)", fontSize: "0.9rem", marginBottom: "6px" }}>Quiz Duration</p>
              <p style={{ color: "var(--quiz-gold-400)", fontSize: "1.4rem", fontWeight: "600" }}>
                {Math.floor(quizConfig.durationMs / 60000)}m {Math.floor((quizConfig.durationMs % 60000) / 1000)}s
              </p>
            </div>
          </div>
          <p style={{ color: "var(--quiz-muted)", fontSize: "0.85rem" }}>
            To change quiz settings, update QUIZ_QUESTION_COUNT and QUIZ_DURATION_MS in your backend environment variables and redeploy.
          </p>
        </div>

        <div className="quiz-card"  style={{ marginTop: "28px" }}>
          <h2 style={{ color: "var(--quiz-gold-400)", marginBottom: "1}>
              <input
                className="quiz-input"
                type="text"
                name="prompt"
                placeholder="Question prompt"
                value={formData.prompt}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="quiz-grid" style={{ marginBottom: "16px" }}>
              <input
                className="quiz-input"
                type="text"
                name="option1"
                placeholder="Option 1"
                value={formData.option1}
                onChange={handleInputChange}
                required
              />
              <input
                className="quiz-input"
                type="text"
                name="option2"
                placeholder="Option 2"
                value={formData.option2}
                onChange={handleInputChange}
                required
              />
              <input
                className="quiz-input"
                type="text"
                name="option3"
                placeholder="Option 3"
                value={formData.option3}
                onChange={handleInputChange}
                required
              />
              <input
                className="quiz-input"
                type="text"
                name="option4"
                placeholder="Option 4"
                value={formData.option4}
                onChange={handleInputChange}
                required
                <option value={1}>Correct: Option 2</option>
                <option value={2}>Correct: Option 3</option>
                <option value={3}>Correct: Option 4</option>
              </select>

              <input
                className="quiz-input"
                type="text"
                name="category"
                placeholder="Category (e.g., Finance)"
                value={formData.category}
                onChange={handleInputChange}
              />

              <select className="quiz-input" name="difficulty" value={formData.difficulty} onChange={handleInputChange}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {error && <div className="quiz-alert">{error}</div>}
            {success && <div className="quiz-alert" style={{ color: "#b4ffb4" }}>{success}</div>}

            <button type="submit" className="quiz-button gold" style={{ marginTop: "12px" }}>
              <FaPlus style={{ marginRight: "8px" }} />
              Create Question
            </button>
          </form>
        </div>

        <div className="quiz-card" style={{ marginTop: "28px" }}>
          <h2 style={{ color: "var(--quiz-gold-400)", marginBottom: "16px" }}>
            Existing Questions ({questions.length})
          </h2>

          {loading && <p style={{ color: "var(--quiz-muted)" }}>Loading...</p>}

          {!loading && questions.length === 0 && (
            <p style={{ color: "var(--quiz-muted)" }}>No questions yet. Create one above.</p>
          )}

          {!loading && questions.length > 0 && (
            <div style={{ display: "grid", gap: "16px" }}>
              {questions.map((q, index) => (
                <div
                  key={q.id}
                  style={{
                    padding: "18px",
                    borderRadius: "16px",
                    background: "rgba(6, 23, 16, 0.8)",
                    border: "1px solid rgba(92, 146, 44, 0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: "600", marginBottom: "8px", color: "var(--quiz-gold-400)" }}>
                        {index + 1}. {q.prompt}
                      </p>
                      <div style={{ display: "grid", gap: "6px", marginBottom: "8px" }}>
                        {q.options.map((opt, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              color: i === q.correctIndex ? "#b4ffb4" : "var(--quiz-muted)",
                            }}
                          >
                            {i === q.correctIndex && <FaCheckCircle />}
                            <span>
                              {String.fromCharCode(65 + i)}. {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--quiz-muted)" }}>
                        {q.category} · {q.difficulty}
                      </p>
                    </div>
                    <button
                      className="quiz-button ghost"
                      style={{ padding: "8px 12px", fontSize: "0.9rem" }}
                      onClick={() => handleDeleteQuestion(q.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizAdmin;
