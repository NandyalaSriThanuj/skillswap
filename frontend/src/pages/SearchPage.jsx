// src/pages/SearchPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/shared/Navbar';
import UserCard from '../components/shared/UserCard';
import { BtnPrimary, BtnGhost, Input, Select, FormGroup, Textarea, Modal, Spinner } from '../components/shared/UI';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATS = ['All','Technology','Design','Art','Music','Language','Business','Health & Fitness','Lifestyle','Media'];

const ConnectModal = ({ target, onClose }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [form, setForm]   = useState({ requester_skill_id:'', provider_skill_id:'', message:'' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get('/users/skills/all').then(r => setAllSkills(r.data.skills || [])).catch(() => {}); }, []);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/exchanges', { provider_id: target.id, ...form });
      toast.success('Exchange request sent! 🎉'); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open onClose={onClose} maxWidth={520}>
      <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:26, fontWeight:700, marginBottom:4 }}>Connect with {target.name}</h2>
      <p style={{ color:'var(--muted)', fontSize:14, marginBottom:28 }}>Propose a skill exchange — they'll be notified immediately</p>
      <form onSubmit={submit}>
        <FormGroup label="Skill you'll teach them *">
          <Select value={form.requester_skill_id} onChange={e => setForm({...form, requester_skill_id:e.target.value})} required>
            <option value="">Select a skill you can teach…</option>
            {target.skills_wanted?.length > 0 && (
              <optgroup label="✨ They want to learn">
                {target.skills_wanted.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
              </optgroup>
            )}
            <optgroup label="All Skills">
              {allSkills.filter(s => !target.skills_wanted?.find(sw => sw.skill_id === s.id)).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </optgroup>
          </Select>
        </FormGroup>
        <FormGroup label="Skill you want to learn *">
          <Select value={form.provider_skill_id} onChange={e => setForm({...form, provider_skill_id:e.target.value})} required>
            <option value="">Select a skill to learn…</option>
            {target.skills_offered?.map(s => <option key={s.skill_id} value={s.skill_id}>{s.skill_name} ✓</option>)}
          </Select>
        </FormGroup>
        <FormGroup label="Message (optional)">
          <Textarea value={form.message} onChange={e => setForm({...form, message:e.target.value})} rows={3} placeholder={`Hi ${target.name}! I'd love to exchange skills with you…`} />
        </FormGroup>
        <div style={{ marginBottom:20, padding:'12px 16px', borderRadius:10, background:'rgba(108,99,255,.07)', border:'1px solid rgba(108,99,255,.15)', fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
          📧 They'll be notified of your request.<br />✅ Once accepted, you can chat directly.
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <BtnGhost onClick={onClose} style={{ flex:1 }}>Cancel</BtnGhost>
          <BtnPrimary disabled={loading} style={{ flex:1 }}>{loading ? 'Sending…' : 'Send Request 🚀'}</BtnPrimary>
        </div>
      </form>
    </Modal>
  );
};

export default function SearchPage() {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [query, setQuery]         = useState('');
  const [category, setCategory]   = useState('All');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [pages, setPages]         = useState(1);
  const [connectUser, setConnectUser] = useState(null);

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:p, limit:12 });
      if (query) params.append('skill', query);
      if (category !== 'All') params.append('category', category);
      const res = await api.get(`/users/search?${params}`);
      setUsers(res.data.users || []);
      setTotal(res.data.pagination?.total || 0);
      setPages(res.data.pagination?.totalPages || 1);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [query, category]);

  useEffect(() => { const t = setTimeout(() => { setPage(1); fetchUsers(1); }, 300); return () => clearTimeout(t); }, [fetchUsers]);

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:40, fontWeight:700, marginBottom:8 }}>Explore Skills</h1>
          <p style={{ color:'var(--muted)', fontSize:16 }}>Find experts to learn from — or people who need your knowledge</p>
        </div>

        {/* Search Controls */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:20, marginBottom:24 }}>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:240, position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', pointerEvents:'none' }}>🔍</span>
              <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills, topics, people…" style={{ paddingLeft:40 }} />
            </div>
            <Select value={category} onChange={e => setCategory(e.target.value)} style={{ width:'auto', minWidth:160 }}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:28 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding:'7px 18px', borderRadius:100, fontSize:13, fontWeight:600, cursor:'pointer',
              border:`1px solid ${category===c ? 'var(--accent)' : 'var(--border)'}`,
              background: category===c ? 'rgba(108,99,255,.2)' : 'var(--surface2)',
              color: category===c ? 'var(--accent)' : 'var(--muted)', transition:'all .15s',
            }}>{c}</button>
          ))}
        </div>

        <div style={{ marginBottom:20, fontSize:13, color:'var(--muted)' }}>
          {loading ? 'Searching…' : `${total} users found`}
        </div>

        {loading
          ? <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size={48} /></div>
          : users.length === 0
            ? <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
                <h3 style={{ fontFamily:'Clash Display, sans-serif', fontSize:22, marginBottom:8 }}>No users found</h3>
                <p style={{ color:'var(--muted)' }}>Try different search terms or category filters</p>
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
                {users.map(u => <UserCard key={u.id} user={u} onConnect={setConnectUser} />)}
              </div>
        }

        {pages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:40 }}>
            {Array.from({length:pages},(_,i)=>i+1).map(p => (
              <button key={p} onClick={() => { setPage(p); fetchUsers(p); }} style={{
                width:40, height:40, borderRadius:10, fontSize:14, fontWeight:600, cursor:'pointer',
                border:`1px solid ${p===page ? 'var(--accent)' : 'var(--border)'}`,
                background: p===page ? 'var(--accent)' : 'var(--surface2)',
                color: p===page ? 'white' : 'var(--muted)',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
      {connectUser && <ConnectModal target={connectUser} onClose={() => setConnectUser(null)} />}
    </div>
  );
}
