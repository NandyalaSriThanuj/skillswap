// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BtnPrimary, Input, Textarea, FormGroup } from '../components/shared/UI';

const SignupPage = () => {
  const [form, setForm] = useState({ name:'', email:'', password:'', bio:'', location:'' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to SkillSwap 🎉');
      navigate('/profile/edit');
    } catch (err) { toast.error(err.response?.data?.message || 'Signup failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <div style={{ width:64, height:64, borderRadius:18, margin:'0 auto 16px', background:'linear-gradient(135deg,#6c63ff,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'0 8px 32px rgba(108,99,255,.4)' }}>⚡</div>
          <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:32, fontWeight:700 }}>Join SkillSwap</h1>
          <p style={{ color:'var(--muted)', marginTop:6 }}>Trade skills. Earn real value.</p>
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:40 }}>
          <form onSubmit={submit}>
            <FormGroup label="Full Name *"><Input type="text" name="name" value={form.name} onChange={handle} placeholder="Alex Johnson" required /></FormGroup>
            <FormGroup label="Email *"><Input type="email" name="email" value={form.email} onChange={handle} placeholder="alex@email.com" required /></FormGroup>
            <FormGroup label="Password *"><Input type="password" name="password" value={form.password} onChange={handle} placeholder="At least 6 characters" required /></FormGroup>
            <FormGroup label="Location"><Input type="text" name="location" value={form.location} onChange={handle} placeholder="Mumbai, India" /></FormGroup>
            <FormGroup label="Short Bio"><Textarea name="bio" value={form.bio} onChange={handle} placeholder="Tell others about yourself..." rows={3} /></FormGroup>
            <BtnPrimary disabled={loading} style={{ width:'100%', padding:'13px 0', fontSize:15, marginTop:4 }}>{loading ? 'Creating account…' : 'Create Account →'}</BtnPrimary>
          </form>
          <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginTop:20 }}>Already have an account? <Link to="/login" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
