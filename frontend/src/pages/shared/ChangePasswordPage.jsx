import { useState } from 'react';
import { authAPI } from '../../api/endpoints';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const ChangePasswordPage = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required.';
    if (!PASSWORD_REGEX.test(form.newPassword))
      errs.newPassword = 'New password must be 8-16 chars with ≥1 uppercase and ≥1 special character.';
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      await authAPI.updatePassword(form);
      setStatus({ type: 'success', msg: 'Password updated successfully!' });
      setForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setStatus({ type: 'error', msg: data?.error || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Change Password</h1>
      <p className="text-neutral-500 text-sm mb-6">Update your account password securely.</p>

      <div className="card">
        {status.msg && (
          <div className={`mb-6 p-3 rounded-lg text-sm border font-medium ${
            status.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="cp-current" className="block text-sm font-semibold text-neutral-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input
                id="cp-current"
                name="currentPassword"
                type={showCurrent ? 'text' : 'password'}
                autoComplete="current-password"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 text-xs font-medium"
              >
                {showCurrent ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.currentPassword && <p className="field-error">{errors.currentPassword}</p>}
          </div>

          <div>
            <label htmlFor="cp-new" className="block text-sm font-semibold text-neutral-700 mb-1.5">New Password</label>
            <div className="relative">
              <input
                id="cp-new"
                name="newPassword"
                type={showNew ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="8-16 chars, 1 uppercase, 1 special char"
                className="pr-12"
              />
              <button
                type="button"
                aria-label={showNew ? 'Hide new password' : 'Show new password'}
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 text-xs font-medium"
              >
                {showNew ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.newPassword && <p className="field-error">{errors.newPassword}</p>}
          </div>

          <button id="cp-submit" type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating...</>
            ) : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
