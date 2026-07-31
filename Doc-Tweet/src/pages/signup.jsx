import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5555';

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('member'); // 'member' or 'doctor'
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirm_pass: '',
    institution: '',
    specialization: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    const endpoint =
      role === 'doctor'
        ? `${API_BASE}/api/auth/register/doctor`
        : `${API_BASE}/api/auth/register/member`;

    const payload =
      role === 'doctor'
        ? form
        : {
            username: form.username,
            email: form.email,
            password: form.password,
            confirm_pass: form.confirm_pass,
          };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid HTML error. Check if Flask is running on port 5555.');
      }

      const data = await response.json();

      if (!response.ok) {
        const details = Array.isArray(data.errors)
          ? data.errors.join(' ')
          : data.error || 'Registration failed';
        throw new Error(details);
      }

      setMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Join DocTweet</h1>
        <p className="text-sm text-slate-500 mb-6">Create an account to participate in the medical community.</p>

        {/* Role Selection Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setRole('member')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              role === 'member'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient / Member
          </button>
          <button
            type="button"
            onClick={() => setRole('doctor')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              role === 'doctor'
                ? 'bg-[#00A896] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor / Specialist
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</div>}
        {message && <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 text-sm">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
            />
          </div>

          {/* Conditional Doctor Fields */}
          {role === 'doctor' && (
            <>
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-slate-700 mb-1">
                  Institution / Hospital
                </label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  value={form.institution}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Johns Hopkins Hospital"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-slate-700 mb-1">
                  Specialization
                </label>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  value={form.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="confirm_pass" className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirm_pass"
              name="confirm_pass"
              type="password"
              value={form.confirm_pass}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0052CC] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#0052CC] hover:bg-blue-700 px-4 py-2.5 font-semibold text-white transition-colors disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : `Register as ${role === 'doctor' ? 'Doctor' : 'Member'}`}
          </button>
        </form>
      </div>

      <div className="mt-4 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="text-[#0052CC] font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}

export default Signup;
