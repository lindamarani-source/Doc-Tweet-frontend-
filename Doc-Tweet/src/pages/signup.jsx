import React from "react";
export default function Signup() { return <div className="p-8">Signup Page</div>; }
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://doc-tweet-backend.onrender.com';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_pass: '',
    role: 'member',
    institution: '',
  });
  const [cvFile, setCvFile] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isDoctor = form.role === 'doctor';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!form.username.trim() || !form.email.trim() || !form.password || !form.confirm_pass) {
      setError('Please complete all fields before registering.');
      return;
    }

    if (form.password !== form.confirm_pass) {
      setError('Passwords do not match.');
      return;
    }

    if (isDoctor) {
      if (!form.institution.trim()) {
        setError('Please enter your institution before registering as a doctor.');
        return;
      }

      if (!cvFile) {
        setError('Please upload your CV before registering as a doctor.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        confirm_pass: form.confirm_pass,
        role: form.role,
      };

      let requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      if (isDoctor) {
        payload.institution = form.institution.trim();
        if (cvFile) {
          const formData = new FormData();
          formData.append('username', form.username.trim());
          formData.append('email', form.email.trim());
          formData.append('password', form.password);
          formData.append('confirm_pass', form.confirm_pass);
          formData.append('role', form.role);
          formData.append('institution', form.institution.trim());
          formData.append('cv', cvFile, cvFile.name);

          requestOptions = {
            method: 'POST',
            body: formData,
          };
        }
      }

      const response = await fetch(`${API_BASE}/api/auth/register/member`, requestOptions);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? data.errors.join(' ')
          : data.error || data.msg || data.message || 'Registration failed';
        throw new Error(details);
      }

      setMessage('Account created successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Register to Doc-Tweet</h1>
        {error && <div className="mb-4 rounded bg-red-50 text-red-700 p-3">{error}</div>}
        {message && <div className="mb-4 rounded bg-green-50 text-green-700 p-3">{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={(e) => setForm((current) => ({ ...current, username: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={(e) => setForm((current) => ({ ...current, role: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="member">Member</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          {isDoctor && (
            <>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  value={form.institution}
                  onChange={(e) => setForm((current) => ({ ...current, institution: e.target.value }))}
                  placeholder="Enter your institution"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="cv" className="block text-sm font-medium text-gray-700 mb-1">CV Upload</label>
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                {cvFile && <p className="mt-2 text-sm text-gray-600">Selected file: {cvFile.name}</p>}
              </div>
            </>
          )}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="confirm-pass" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirm-pass"
              name="confirm_pass"
              type="password"
              value={form.confirm_pass}
              onChange={(e) => setForm((current) => ({ ...current, confirm_pass: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Signup'}
          </button>
        </form>
      </div>
      <div className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-medium">Login</Link>
      </div>
    </div>
  );
}

export default Signup;
