import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link to="/" className="text-xl font-bold text-blue-600">
        🩺 Doc-Tweet
      </Link>
      
      <div className="flex gap-4 font-medium text-gray-600">
        <Link to="/" className="hover:text-blue-600 transition">Home</Link>
        <Link to="/posts" className="hover:text-blue-600 transition">Posts</Link>
        <Link to="/profile" className="hover:text-blue-600 transition">Profile</Link>
        <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
      </div>
    </nav>
  );
}