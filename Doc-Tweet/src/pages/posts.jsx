import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doc-tweet-backend.onrender.com';

export default function Posts() {
  const { user, token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const authToken = token || localStorage.getItem('token') || localStorage.getItem('doctweet_token') || '';

  const fetchQuestions = () => {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${API_BASE}/api/getquestions`, { headers })
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch((err) => console.log('Error fetching questions:', err));
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: title,
          content: content,
          author: isAnonymous ? 'Anonymous' : (user?.username || 'Unknown'),
          is_anonymous: isAnonymous,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to post question');
      }

      setTitle('');
      setContent('');
      setIsAnonymous(false);
      fetchQuestions();
    } catch (err) {
      setError(err.message || 'Error saving question');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Ask a Medical Question</h1>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <input
          type="text"
          placeholder="Question Title"
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Provide more details about your health query..."
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {error && (
          <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Ask Anonymously
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Question'}
          </button>
        </div>
      </form>

      {/* Questions Feed */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Community Questions</h2>
        {questions.length === 0 ? (
          <p className="text-gray-500">No questions posted yet.</p>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{q.title}</h3>
              <p className="text-gray-700 mb-3">{q.content}</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>
                  Asked by:{' '}
                  <strong className="text-gray-700">
                    {q.is_anonymous ? 'Anonymous' : q.author}
                  </strong>
                </span>
                <span>{q.created_at}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}