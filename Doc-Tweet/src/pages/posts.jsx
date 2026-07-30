import React, { useState, useEffect } from 'react';

export default function Posts() {
  const [items, setItems] = useState([]);
  const [entryType, setEntryType] = useState('question');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchQuestionsAndBlogs = () => {
    fetch('http://localhost:5000/api/posts?type=question_blog')
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.log('Error fetching items:', err));
  };

  useEffect(() => {
    fetchQuestionsAndBlogs();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    fetch('http://localhost:5000/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        author_name: 'Dr. Alex',
        author_role: 'Doctor',
        type: entryType,
        title: title,
        content: content
      })
    })
      .then((res) => res.json())
      .then(() => {
        setTitle('');
        setContent('');
        fetchQuestionsAndBlogs();
      })
      .catch((err) => console.log('Error creating entry:', err));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Medical Discussions & Blogs</h1>

      {/* Creation Box */}
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setEntryType('question')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              entryType === 'question' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Ask Question
          </button>
          <button
            type="button"
            onClick={() => setEntryType('blog')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              entryType === 'blog' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Write Blog
          </button>
        </div>

        <input
          type="text"
          placeholder="Title / Topic"
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Detailed description or article text..."
          className="w-full p-2.5 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          type="submit"
          className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700 text-sm font-medium"
        >
          Publish {entryType === 'question' ? 'Question' : 'Article'}
        </button>
      </form>

      {/* List */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <span
              className={`inline-block text-xs font-bold uppercase px-2 py-0.5 rounded mb-2 ${
                item.type === 'question' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
              }`}
            >
              {item.type}
            </span>
            <h2 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h2>
            <p className="text-gray-700 mb-3">{item.content}</p>
            <div className="text-xs text-gray-500">
              Posted by <span className="font-medium text-gray-700">{item.author_name}</span> ({item.author_role})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}