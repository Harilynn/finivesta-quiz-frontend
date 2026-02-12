import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard, streamLeaderboard } from "./quizApi";
import QuizBackground from "./QuizBackground";
import "./Quiz.css";

const formatDuration = (ms) => {
  const clamped = Math.max(0, ms);
  const minutes = Math.floor(clamped / 60000);
  const seconds = Math.floor((clamped % 60000) / 1000);
  const milliseconds = Math.floor(clamped % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(
    milliseconds
  ).padStart(3, "0")}`;
};

const QuizLeaderboard = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [streamActive, setStreamActive] = useState(true);
  const sessionId = localStorage.getItem("quizSessionId");

  useEffect(() => {
    let mounted = true;
    getLeaderboard()
      .then((data) => {
        if (mounted) {
          setEntries(data.entries || []);
          setLoading(false);
          setVisible(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let eventSource;
    if (streamActive) {
      eventSource = streamLeaderboard(
        (data) => {
          setEntries(data.entries || []);
        },
        () => {
          setStreamActive(false);
        }
      );
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [streamActive]);

  useEffect(() => {
    if (streamActive) return;
    const interval = setInterval(() => {
      getLeaderboard()
        .then((data) => {
          setEntries(data.entries || []);
        })
        .catch(() => undefined);
    }, 5000);

    return () => clearInterval(interval);
  }, [streamActive]);

  return (
    <div className="quiz-shell">
      <QuizBackground count={20} />
      <div className="quiz-container">
        <h1 className="quiz-title">Leaderboard</h1>
        <p className="quiz-subtitle">Sorted by score, then fastest completion time.</p>

        <div className="quiz-card">
          {loading ? (
            <div>Loading leaderboard...</div>
          ) : (
            <div className={`quiz-leaderboard ${visible ? "visible" : ""}`}>
              <div className="quiz-leaderboard-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Score</span>
                <span>Time</span>
              </div>
              {entries.map((entry, index) => (
                <div
                  key={entry.sessionId}
                  className={`quiz-leaderboard-row ${entry.sessionId === sessionId ? "highlight" : ""} animate`}
                >
                  <span>#{index + 1}</span>
                  <span>
                    {entry.playerName}
                    {entry.sessionId === sessionId && <span className="quiz-badge">You</span>}
                  </span>
                  <span>
                    {entry.score}/{entry.totalQuestions}
                  </span>
                  <span>{formatDuration(entry.timeTakenMs)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="quiz-actions" style={{ marginTop: "20px" }}>
            <button className="quiz-button ghost" onClick={() => navigate("/quiz")}>
              New Session
            </button>
            <button className="quiz-button" onClick={() => navigate("/")}>Back to Home</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLeaderboard;
