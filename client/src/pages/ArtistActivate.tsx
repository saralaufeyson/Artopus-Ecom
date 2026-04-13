import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ArtistActivate: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    whatsappNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/artist-activate', form);
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common.Authorization = `Bearer ${res.data.token}`;
      toast.success('Artist account activated');
      navigate('/artist-dashboard');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not activate artist account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Activate Artist Login</h1>
          <p className="auth-subtitle">Use the approved artist email from your Artopus profile</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input className="auth-input" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="auth-input" placeholder="Approved Artist Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="auth-input" placeholder="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="auth-input" placeholder="WhatsApp Number" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
            <input className="auth-input" placeholder="Create Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <button type="submit" className="auth-button" disabled={loading}>{loading ? 'Activating...' : 'Activate Artist Access'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ArtistActivate;
