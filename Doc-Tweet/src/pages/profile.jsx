import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5555';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setMessage('No active session. Please log in.');
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/current_user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setUsername(data.username || '');
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: username
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Profile updated successfully!');
        setProfile(prev => ({ ...prev, username: data.username || username }));
      } else {
        setMessage(data.msg || 'Update failed');
      }
    } catch (err) {
      setMessage('Server error while saving profile updates.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p className="text-gray-500 font-medium animate-pulse">Loading profile...</p>
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
      
      {profile && (
        <>
          {/* Account Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Account Settings
            </h3>

            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">Email: </span>
                {profile.email}
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
                {profile.role || 'member'}
              </div>
            </div>
          </div>

          {/* Favorite Doctors */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              Favorite Doctors
            </h3>

            {!profile.favorite_doctors || profile.favorite_doctors.length === 0 ? (
              <p className="text-gray-500 italic text-sm">
                You haven't saved any favorite doctors yet.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {profile.favorite_doctors.map((doc) => (
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
        </>
      )}
    </div>
  );
}
