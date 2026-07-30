import React from 'react';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to DocTweet</h1>
      <p className="text-gray-600 mb-6">Home page under construction.</p>
      <a 
        href="/posts" 
        className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
      >
        View Medical Questions (/posts)
      </a>
    </div>
  );
}