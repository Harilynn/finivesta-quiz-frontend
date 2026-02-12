const API_BASE = process.env.REACT_APP_QUIZ_API_BASE || "http://localhost:4000";

const handleResponse = async (res) => {
  if (!res.ok) {
    let payload = {};
    try {
      payload = await res.json();
    } catch (error) {
      payload = {};
    }
    const message = payload.error || payload.message || "Request failed";
    throw new Error(message);
  }
  return res.json();
};

export const startQuiz = async (payload) => {
  const res = await fetch(`${API_BASE}/quiz/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const getSession = async (sessionId) => {
  const res = await fetch(`${API_BASE}/quiz/session/${sessionId}`);
  return handleResponse(res);
};

export const submitQuiz = async (payload) => {
  const res = await fetch(`${API_BASE}/quiz/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const getLeaderboard = async (limit = 20) => {
  const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}`);
  return handleResponse(res);
};

export const streamLeaderboard = (onMessage, onError) => {
  const eventSource = new EventSource(`${API_BASE}/leaderboard/stream`);
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      onMessage({ entries: [] });
    }
  };
  eventSource.onerror = () => {
    if (onError) {
      onError();
    }
  };
  return eventSource;
};
