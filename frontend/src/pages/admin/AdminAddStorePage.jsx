import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../api/endpoints';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/;

const validate = (form) => {
  const errs = {};
  if (!form.name) errs.name = 'Store name is required.';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid store email.';
  if (!form.address || form.address.length > 400) errs.address = 'Address is required (max 400 chars).';
  if (!form.ownerName || form.ownerName.length < 20 || form.ownerName.length > 60)
    errs.ownerName = 'Owner name must be 20-60 characters.';
  if (!form.ownerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail)) errs.ownerEmail = 'Invalid owner email.';
  if (!PASSWORD_REGEX.test(form.ownerPassword))
    errs.ownerPassword = 'Password must be 8-16 chars with ≥1 uppercase and ≥1 special character.';
  return errs;
};

const AdminAddStorePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', address: '',
    ownerName: '', ownerEmail: '', ownerPassword: '',
  });
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
      await adminAPI.createStore(form);
      navigate('/admin/stores');
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) setErrors(data.errors);
      else setServerError(data?.error || 'Failed to create store.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/stores" className="text-neutral-500 hover:text-neutral-900 text-sm font-medium">← Stores</Link>
        <span className="text-neutral-300">/</span>
        <span className="text-neutral-500 text-sm">New Store</span>
      </div>

      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Add New Store</h1>

      <div className="card space-y-6">
        {serverError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Store Info */}
          <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Store Information</h2>
          <div>
            <label htmlFor="as-name" className="block text-sm font-medium text-neutral-700 mb-1">Store Name</label>
            <input id="as-name" name="name" type="text" value={form.name} onChange={handleChange} placeholder="Store name" />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="as-email" className="block text-sm font-medium text-neutral-700 mb-1">Store Email</label>
            <input id="as-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="store@example.com" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="as-address" className="block text-sm font-medium text-neutral-700 mb-1">Store Address</label>
            <textarea id="as-address" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Max 400 characters" />
            {errors.address && <p className="field-error">{errors.address}</p>}
          </div>

          {/* Owner Info */}
          <div className="pt-6 border-t border-neutral-200 mt-6">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4">Store Owner Account</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="as-ownerName" className="block text-sm font-medium text-neutral-700 mb-1">Owner Full Name</label>
                <input id="as-ownerName" name="ownerName" type="text" value={form.ownerName} onChange={handleChange} placeholder="20-60 characters" />
                {errors.ownerName && <p className="field-error">{errors.ownerName}</p>}
              </div>

              <div>
                <label htmlFor="as-ownerEmail" className="block text-sm font-medium text-neutral-700 mb-1">Owner Email</label>
                <input id="as-ownerEmail" name="ownerEmail" type="email" value={form.ownerEmail} onChange={handleChange} placeholder="owner@example.com" />
                {errors.ownerEmail && <p className="field-error">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label htmlFor="as-ownerPassword" className="block text-sm font-medium text-neutral-700 mb-1">Owner Password</label>
                <div className="relative">
                  <input id="as-ownerPassword" name="ownerPassword" type={showPass ? 'text' : 'password'}
                    value={form.ownerPassword} onChange={handleChange}
                    placeholder="8-16 chars, 1 uppercase, 1 special" className="pr-12" />
                  <button type="button" aria-label={showPass ? 'Hide password' : 'Show password'} onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 text-xs font-medium">
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.ownerPassword && <p className="field-error">{errors.ownerPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <button id="as-submit" type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</> : 'Create Store'}
            </button>
            <Link to="/admin/stores" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddStorePage;
