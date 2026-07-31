import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doc-tweet-backend.onrender.com';

export default function Home() {
  const { token, user } = useAuth();
  const [tab, setTab] = useState('all');
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState({});
  const [answering, setAnswering] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});

  const authToken = token || localStorage.getItem('token') || localStorage.getItem('doctweet_token') || '';

  useEffect(() => {
    setLoading(true);

    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

    Promise.all([
      fetch(`${API_BASE}/api/getposts`, { headers }),
      fetch(`${API_BASE}/api/getquestions`, { headers }),
    ])
      .then(async ([postsRes, questionsRes]) => {
        // Defensive check for JSON headers
        const postsType = postsRes.headers.get("content-type") || "";
        const questionsType = questionsRes.headers.get("content-type") || "";

        if (!postsType.includes("application/json") || !questionsType.includes("application/json")) {
          throw new Error("Received non-JSON response from backend. Make sure Flask is running on port 5555.");
        }

        if (!postsRes.ok || !questionsRes.ok) {
          throw new Error('Something went wrong');
        }

        const [postsData, questionsData] = await Promise.all([
          postsRes.json(),
          questionsRes.json(),
        ]);

        const posts = (postsData || []).map((item) => ({ ...item, type: 'post' }));
        const questions = (questionsData || []).map((item) => ({ ...item, type: 'question' }));

        const merged = [...posts, ...questions].sort((a, b) => {
          const aDate = new Date(a.created_at || 0).getTime();
          const bDate = new Date(b.created_at || 0).getTime();
          return bDate - aDate;
        });

        const filtered =
          tab === 'posts'
            ? merged.filter((item) => item.type === 'post')
            : tab === 'questions'
            ? merged.filter((item) => item.type === 'question')
            : merged;

        setFeed(filtered);
        setLoading(false);
        setErr('');
      })
      .catch(() => {
        setErr('Failed to load feed');
        setLoading(false);
      });
  }, [tab, authToken]);

  function timeAgo(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const sec = (now - d) / 1000;
    if (sec < 60) return 'now';
    if (sec < 3600) return Math.floor(sec / 60) + 'm';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h';
    if (sec < 604800) return Math.floor(sec / 86400) + 'd';
    return d.toLocaleDateString();
  }

  async function submitAnswer(question) {
    const answer = (answerDrafts[question.id] || '').trim();
    if (!answer) return;

    setAnswering((current) => ({ ...current, [question.id]: true }));
    setAnswerErrors((current) => ({ ...current, [question.id]: '' }));

    const endpoints = [
      `${API_BASE}/api/questions/${question.id}/answers`,
      `${API_BASE}/api/questions/${question.id}/answer`,
      `${API_BASE}/api/answers`,
    ];

    const payload = {
      content: answer,
      question_id: question.id,
      author: user?.username || 'Unknown',
    };

    let lastError = 'Failed to save answer';

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);
          const newAnswer = {
            content: answer,
            author: user?.username || 'Unknown',
            created_at: new Date().toISOString(),
            ...(data || {}),
          };

          setFeed((current) =>
            current.map((item) =>
              item.id === question.id && item.type === 'question'
                ? {
                    ...item,
                    answers: [...(item.answers || []), newAnswer],
                  }
                : item,
            ),
          );

          setAnswerDrafts((current) => ({ ...current, [question.id]: '' }));
          setAnswerErrors((current) => ({ ...current, [question.id]: '' }));
          return;
        }

        const data = await response.json().catch(() => ({}));
        lastError = data.error || data.message || 'Failed to save answer';
      } catch (submissionError) {
        lastError = submissionError.message || 'Failed to save answer';
      }
    }

    setAnswerErrors((current) => ({ ...current, [question.id]: lastError }));
    setAnswering((current) => ({ ...current, [question.id]: false }));
  }

  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen border-l border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-200 px-5 py-4 z-50">
        <h1 className="text-xl font-extrabold mb-3">Home</h1>
        <div className="flex">
          {['all', 'posts', 'questions'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-center py-3 font-semibold text-sm border-b-2 transition-colors ${
                tab === t
                  ? 'text-gray-900 border-blue-500'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {t === 'all' ? 'All' : t === 'posts' ? 'Posts' : 'Questions'}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div>
        {loading && feed.length === 0 && (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        )}

        {err && (
          <div className="text-center py-10 text-red-600">
            {err}
            <br />
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-blue-500 font-medium"
            >
              Refresh
            </button>
          </div>
        )}

        {!loading && feed.length === 0 && !err && (
          <div className="text-center py-10 text-gray-500">Nothing here yet</div>
        )}

        {feed.map((item, idx) => {
          if (item.type === 'post') {
            // Backend returns author as a string, not an object
            const authorName = item.author || 'Unknown';
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div key={idx} className="border-b border-gray-200 px-5 py-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-900">{authorName}</span>
                    </div>
                    <div className="text-gray-500 text-sm">
                      @{authorName.toLowerCase().replace(/\s+/g, '')} · {timeAgo(item.created_at)}
                    </div>
                    <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                      Post
                    </div>
                    <div className="text-lg font-bold mb-1.5">{item.title}</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{item.content}</div>
                    {item.image_url && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                        <img src={item.image_url} className="w-full block" alt="" />
                      </div>
                    )}
                    <div className="flex gap-6 mt-3 text-gray-500 text-sm">
                      <span>♥ {item.likes_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            // Question
            const q = item;
            const qAuthor = q.author || 'Unknown';
            const isAnon = q.is_anonymous;
            const authorName = isAnon ? 'Anonymous' : qAuthor;
            const initial = authorName.charAt(0).toUpperCase();

            return (
              <div key={idx} className="border-b border-gray-200 px-5 py-4">
                <div className="flex gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 ${
                      isAnon ? 'bg-gray-500' : 'bg-blue-500'
                    }`}
                  >
                    {isAnon ? '?' : initial}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-gray-900">{authorName}</span>
                      {isAnon && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-gray-500 text-white">
                          Anonymous
                        </span>
                      )}
                      {q.is_resolved && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase bg-green-500 text-white">
                          Resolved
                        </span>
                      )}
                    </div>
                    {!isAnon && (
                      <div className="text-gray-500 text-sm">
                        @{qAuthor.toLowerCase().replace(/\s+/g, '')} · {timeAgo(q.created_at)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">
                      Question
                    </div>
                    <div className="text-lg font-bold mb-1.5">{q.title}</div>
                    <div className="text-gray-900 whitespace-pre-wrap">{q.content}</div>

                    {(q.answers || []).length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Answers
                        </div>
                        {(q.answers || []).map((answer, answerIndex) => (
                          <div
                            key={`${q.id}-answer-${answerIndex}`}
                            className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-sm text-gray-700"
                          >
                            <div className="font-semibold text-gray-900 mb-1">
                              {answer.author || 'Unknown'}
                            </div>
                            <div className="whitespace-pre-wrap">{answer.content}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                        Add an answer
                      </label>
                      <textarea
                        rows="3"
                        value={answerDrafts[q.id] || ''}
                        onChange={(e) =>
                          setAnswerDrafts((current) => ({
                            ...current,
                            [q.id]: e.target.value,
                          }))
                        }
                        placeholder="Write a helpful answer..."
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {answerErrors[q.id] && (
                        <div className="mt-2 text-sm text-red-600">{answerErrors[q.id]}</div>
                      )}

                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => submitAnswer(q)}
                          disabled={answering[q.id]}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
                        >
                          {answering[q.id] ? 'Posting...' : 'Post Answer'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
