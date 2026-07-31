import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <Link to="/" className="text-xl font-bold text-blue-600">
        🩺 Doc-Tweet
      </Link>

      <div className="flex gap-4 font-medium text-gray-600 items-center">
        <Link to="/" className="hover:text-blue-600 transition">Home</Link>
        <Link to="/posts" className="hover:text-blue-600 transition">Posts</Link>
        {user ? (
          <>
            <Link to="/profile" className="hover:text-blue-600 transition">Profile</Link>
            <button
              onClick={logout}
              className="hover:text-blue-600 transition bg-transparent border-none cursor-pointer font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-600 transition">Login</Link>
            <Link to="/signup" className="hover:text-blue-600 transition">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}