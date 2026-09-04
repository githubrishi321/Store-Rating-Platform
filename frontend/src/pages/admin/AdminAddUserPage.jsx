import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { adminAPI } from '../../api/endpoints';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const validate = (form) => {
  const errs = {};
  if (!form.name || form.name.length < 20 || form.name.length > 60)
    errs.name = 'Name must be between 20 and 60 characters.';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errs.email = 'Invalid email format.';
  if (!PASSWORD_REGEX.test(form.password))
    errs.password = 'Password must be 8-16 chars with ≥1 uppercase and ≥1 special character.';
  if (!form.address || form.address.length > 400)
    errs.address = 'Address is required and must be max 400 characters.';
  if (!form.role) errs.role = 'Role is required.';
  return errs;
};

const AdminAddUserPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '', role: 'NORMAL_USER' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await adminAPI.createUser(form);
      navigate('/admin/users');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.error || 'Failed to create user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 mb-6 text-sm">
        <Link to="/admin/users" className="flex items-center gap-1 text-slate-500 hover:text-slate-900 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded">
          <ChevronLeft size={15} />
          Users
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-500">New User</span>
      </div>

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New User</h1>

      <div className="card">
        {serverError && (
          <div className="mb-5 alert-error rounded-lg">
            <span>{serverError}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="au-name" className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input id="au-name" name="name" value={form.name} onChange={handleChange} placeholder="20–60 characters" />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="au-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
            <input id="au-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="user@example.com" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="au-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="au-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="8–16 chars, 1 uppercase, 1 special"
                className="pr-11"
              />
              <button
                type="button"
                aria-label={showPass ? 'Hide password' : 'Show password'}
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none rounded"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="au-address" className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <textarea id="au-address" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Max 400 characters" />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>

          <div>
            <label htmlFor="au-role" className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select id="au-role" name="role" value={form.role} onChange={handleChange}>
              <option value="NORMAL_USER">Normal User</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && <p className="field-error">{errors.role}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button id="au-submit" type="submit" disabled={loading} className="btn-primary flex-1">
              {loading
                ? <><div className="spinner spinner-sm spinner-white" />Creating...</>
                : 'Create User'}
            </button>
            <Link to="/admin/users" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddUserPage;
