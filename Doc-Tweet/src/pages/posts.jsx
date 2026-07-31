import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doc-tweet-backend.onrender.com';

export default function Posts() {
  const { user, token } = useAuth();
  const [entryType, setEntryType] = useState('question');
  const [questions, setQuestions] = useState([]);
  const [posts, setPosts] = useState([]);
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

  const fetchPosts = () => {
    const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
    fetch(`${API_BASE}/api/getposts`, { headers })
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log('Error fetching posts:', err));
  };

  useEffect(() => {
    fetchQuestions();
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const endpoint = entryType === 'question' ? '/api/questions' : '/api/posts';
      const payload =
        entryType === 'question'
          ? {
              title,
              content,
              author: isAnonymous ? 'Anonymous' : user?.username || 'Unknown',
              is_anonymous: isAnonymous,
            }
          : {
              title,
              content,
              author: user?.username || 'Unknown',
            };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || `Failed to post ${entryType}`);
      }

      setTitle('');
      setContent('');
      setIsAnonymous(false);

      if (entryType === 'question') {
        fetchQuestions();
      } else {
        fetchPosts();
      }
    } catch (err) {
      setError(err.message || `Error saving ${entryType}`);
    } finally {
      setSubmitting(false);
    }
  };

  const isQuestionMode = entryType === 'question';

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Create a Post or Ask a Question</h1>

      <div className="mb-4 flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
        {['question', 'post'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setEntryType(type);
              setError('');
            }}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
              entryType === type
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-white'
            }`}
          >
            {type === 'question' ? 'Question' : 'Post'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <input
          type="text"
          placeholder={isQuestionMode ? 'Question Title' : 'Post Title'}
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder={
            isQuestionMode
              ? 'Provide more details about your health query...'
              : 'Share your thoughts, update, or experience with the community...'
          }
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {error && (
          <div className="mb-3 p-2.5 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between gap-4 flex-wrap">
          {isQuestionMode ? (
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Ask Anonymously
            </label>
          ) : (
            <span className="text-sm text-gray-500">Posting publicly as {user?.username || 'Unknown'}</span>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : `Submit ${isQuestionMode ? 'Question' : 'Post'}`}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
          {['question', 'post'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEntryType(type)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition-colors ${
                entryType === type
                  ? 'bg-white text-blue-600 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'question' ? 'Community Questions' : 'Community Posts'}
            </button>
          ))}
        </div>

        {isQuestionMode ? (
          questions.length === 0 ? (
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
          )
        ) : posts.length === 0 ? (
          <p className="text-gray-500">No posts published yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-gray-700 mb-3">{post.content}</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>
                  Posted by:{' '}
                  <strong className="text-gray-700">{post.author || 'Unknown'}</strong>
                </span>
                <span>{post.created_at}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
