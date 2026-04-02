// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { BtnPrimary, Input, FormGroup } from '../components/shared/UI';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', zIndex:1 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ width:64, height:64, borderRadius:18, margin:'0 auto 16px', background:'linear-gradient(135deg,#6c63ff,#ff6b6b)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, boxShadow:'0 8px 32px rgba(108,99,255,.4)' }}>⚡</div>
          <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:32, fontWeight:700 }}>Welcome Back</h1>
          <p style={{ color:'var(--muted)', marginTop:6 }}>Sign in to your SkillSwap account</p>
        </div>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:24, padding:40 }}>
          <form onSubmit={submit}>
            <FormGroup label="Email"><Input type="email" name="email" value={form.email} onChange={handle} placeholder="you@email.com" required /></FormGroup>
            <FormGroup label="Password"><Input type="password" name="password" value={form.password} onChange={handle} placeholder="••••••••" required /></FormGroup>
            <BtnPrimary disabled={loading} style={{ width:'100%', padding:'13px 0', fontSize:15, marginTop:8 }}>{loading ? 'Signing in…' : 'Sign In →'}</BtnPrimary>
          </form>
          <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginTop:20 }}>No account? <Link to="/signup" style={{ color:'var(--accent)', textDecoration:'none', fontWeight:600 }}>Create one free</Link></p>
          <div style={{ marginTop:20, padding:'12px 16px', borderRadius:10, background:'rgba(255,215,0,.06)', border:'1px solid rgba(255,215,0,.15)', fontSize:12, color:'var(--muted)', textAlign:'center' }}>💡 <strong style={{ color:'#ffd700' }}>Demo:</strong> Register a new account to get started!</div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
