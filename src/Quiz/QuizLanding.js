import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChartLine, FaCoins, FaLandmark, FaPiggyBank, FaWallet } from "react-icons/fa";
import { GiReceiveMoney, GiPayMoney, GiStack } from "react-icons/gi";
import { startQuiz, getSession } from "./quizApi";
import "./Quiz.css";

const floatingIcons = [
  FaChartLine,
  FaCoins,
  FaLandmark,
  FaPiggyBank,
  FaWallet,
  GiReceiveMoney,
  GiPayMoney,
  GiStack,
];

const buildFloatingIconProps = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const x = `${10 + (index * 11) % 80}%`;
    const y = `${8 + (index * 13) % 80}%`;
    const size = `${24 + (index % 4) * 12}px`;
    const delay = `${(index % 6) * -1.2}s`;
    return { x, y, size, delay, twinkle: index % 2 === 0 };
  });
};

const QuizLanding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessGranted, setAccessGranted] = useState(
    () => sessionStorage.getItem("quizAccessGranted") === "true"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeReady, setResumeReady] = useState(false);
  const floatingProps = useMemo(() => buildFloatingIconProps(14), []);

  useEffect(() => {
    // Clear access on component mount to force passcode re-entry
    sessionStorage.removeItem("quizAccessGranted");
    setAccessGranted(false);
  }, []);

  useEffect(() => {
    const sessionId = localStorage.getItem("quizSessionId");
    if (!sessionId) {
      setResumeReady(false);
      return;
    }

    let mounted = true;
    getSession(sessionId)
      .then(() => {
        if (mounted) {
          setResumeReady(true);
        }
      })
      .catch(() => {
        localStorage.removeItem("quizSessionId");
        localStorage.removeItem("quizQuestions");
        if (mounted) {
          setResumeReady(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (location.state && location.state.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const handleAccess = () => {
    if (accessCode === "FiniMeansLife01234") {
      setAccessGranted(true);
      setAccessError("");
      sessionStorage.setItem("quizAccessGranted", "true");
      return;
    }

    setAccessError("Wrong passcode. You could not participate in the quiz.");
  };

  const handleRetryAccess = () => {
    setAccessCode("");
    setAccessError("");
  };

  const handleStart = async () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name to start.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
      };
      const data = await startQuiz(payload);
      localStorage.setItem("quizSessionId", data.sessionId);
      localStorage.setItem("quizQuestions", JSON.stringify(data.questions || []));
      localStorage.setItem("quizStartedAt", data.startedAt);
      localStorage.setItem("quizExpiresAt", data.expiresAt);
      localStorage.setItem("quizDurationMs", data.durationMs);
      localStorage.setItem("quizServerTime", data.serverTime);
      localStorage.setItem("quizPlayerName", data.player?.name || payload.name);
      localStorage.setItem("quizPlayerId", data.player?.id || "");
      navigate("/quiz/play");
    } catch (err) {
      setError(err.message || "Unable to start quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    navigate("/quiz/play");
  };

  return (
    <div className="quiz-shell">
      <div className="quiz-floating-icons">
        {floatingProps.map((props, index) => {
          const Icon = floatingIcons[index % floatingIcons.length];
          const className = props.twinkle ? "quiz-floating-icon quiz-twinkle" : "quiz-floating-icon";
          return (
            <span
              key={`icon-${index}`}
              className={className}
              style={{
                "--x": props.x,
                "--y": props.y,
                "--size": props.size,
                "--delay": props.delay,
              }}
            >
              <Icon />
            </span>
          );
        })}
      </div>

      <div className="quiz-container">
        {!accessGranted ? (
          <div className="quiz-card quiz-gate">
            <h1 className="quiz-title">Team Access</h1>
            <p className="quiz-subtitle">
              This quiz is restricted to Finivesta team members. Enter the access code to continue.
            </p>
            <input
              className="quiz-input"
              type="password"
              placeholder="Enter team passcode"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
            />
            {accessError && <div className="quiz-alert quiz-gate-message">{accessError}</div>}
            <div className="quiz-actions">
              <button className="quiz-button gold" onClick={handleAccess}>
                Enter Quiz
              </button>
              <button className="quiz-button ghost" onClick={handleRetryAccess}>
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="quiz-title">Finivesta Vault Quiz</h1>
            <p className="quiz-subtitle">
              A secure, finance-first challenge with randomized questions, server-verified timing, and a
              live leaderboard. Enter your details to begin.
            </p>

            <div className="quiz-card">
              <div className="quiz-grid">
                <input
                  className="quiz-input"
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <input
                  className="quiz-input"
                  type="email"
                  placeholder="Email (optional)"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <input
                  className="quiz-input"
                  type="text"
                  placeholder="College or organization (optional)"
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                />
              </div>

              {error && <div className="quiz-alert">{error}</div>}

              <div className="quiz-actions">
                <button className="quiz-button gold" onClick={handleStart} disabled={loading}>
                  {loading ? "Starting..." : "Start Quiz"}
                </button>
                {resumeReady && (
                  <button className="quiz-button ghost" onClick={handleResume}>
                    Resume Session
                  </button>
                )}
              </div>

              <div className="quiz-rules">
                <div className="quiz-rule">
                  <span>01</span> Answer all questions before you can submit.
                </div>
                <div className="quiz-rule">
                  <span>02</span> Randomized finance questions are locked to your session.
                </div>
                <div className="quiz-rule">
                  <span>03</span> Server time controls the timer down to milliseconds.
                </div>
                <div className="quiz-rule">
                  <span>04</span> One submission per session. Refreshing will not reset anything.
                </div>
                <div className="quiz-rule">
                  <span>05</span> Leaderboard ranks by score, then by fastest completion time.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default QuizLanding;
