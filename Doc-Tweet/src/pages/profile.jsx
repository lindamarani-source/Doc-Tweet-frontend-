import { useState } from 'react';
import { useAuth } from '../AuthContext/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doc-tweet-backend.onrender.com';

export default function Profile() {
  const { user, token } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const authToken = token || localStorage.getItem('token') || localStorage.getItem('doctweet_token') || '';

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!authToken) {
      setMessage('No active session. Please log in.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.error || data.message || 'Profile update is not yet available on the server.');
      }
    } catch (err) {
      setMessage('Server error while saving profile updates.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 tracking-tight">My Profile</h2>

      {message && (
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-medium">
          {message}
        </div>
      )}

      {/* Account Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
          Account Settings
        </h3>

        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Email: </span>
            {user.email}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold text-gray-700">Role: </span>
            {user.role || 'member'}
          </div>

          {user.is_verified !== undefined && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-gray-700">Verified: </span>
              {user.is_verified ? 'Yes' : 'No'}
            </div>
          )}

          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Favorite Doctors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          Favorite Doctors
        </h3>

        {!user.favorite_doctors || user.favorite_doctors.length === 0 ? (
          <p className="text-gray-500 italic text-sm">
            You haven't saved any favorite doctors yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {user.favorite_doctors.map((doc) => (
              <li key={doc.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">
                    Dr. {doc.name || doc.username}
                  </p>
                  {doc.specialty && (
                    <p className="text-sm text-gray-500">{doc.specialty}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}