// src/pages/AdminPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/shared/Navbar';
import { BtnPrimary, BtnGhost, Input, Select, FormGroup, StatusBadge, LevelBadge, Spinner } from '../components/shared/UI';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [tab, setTab]             = useState('stats');
  const [search, setSearch]       = useState('');
  const [newSkill, setNewSkill]   = useState({ name:'', category:'Technology' });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchUsers(), fetchExchanges()]).finally(() => setLoading(false));
  }, []);

  const fetchStats = async () => {
    try { const r = await api.get('/admin/stats'); setStats(r.data.stats); } catch {}
  };

  const fetchUsers = async (s = '') => {
    try {
      const r = await api.get(`/admin/users${s ? `?search=${s}` : ''}`);
      setUsers(r.data.users || []);
    } catch {}
  };

  const fetchExchanges = async () => {
    try { const r = await api.get('/admin/exchanges'); setExchanges(r.data.exchanges || []); } catch {}
  };

  const toggleUser = async (id, active) => {
    try {
      await api.put(`/admin/users/${id}/toggle`);
      setUsers(p => p.map(u => u.id === id ? { ...u, is_active: !active } : u));
      toast.success(`User ${active ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed'); }
  };

  const addSkill = async e => {
    e.preventDefault();
    try {
      await api.post('/admin/skills', newSkill);
      toast.success('Skill added!');
      setNewSkill({ name:'', category:'Technology' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const TABS = ['stats','users','exchanges','skills'];

  return (
    <div style={{ minHeight:'100vh', paddingTop:80, position:'relative', zIndex:1 }}>
      <Navbar />
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'40px 24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6c63ff)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}></div>
          <div>
            <h1 style={{ fontFamily:'Clash Display, sans-serif', fontSize:28, fontWeight:700 }}>Admin Panel</h1>
            <p style={{ color:'var(--muted)', fontSize:14 }}>Manage the SkillSwap platform</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, padding:4, marginBottom:32, width:'fit-content' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:'9px 24px', borderRadius:10, fontSize:14, fontWeight:600, textTransform:'capitalize', border:'none', cursor:'pointer', background: tab===t ? '#8b5cf6' : 'transparent', color: tab===t ? 'white' : 'var(--muted)', transition:'all .2s' }}>{t}</button>
          ))}
        </div>

        {/* STATS */}
        {tab === 'stats' && (
          loading ? <Spinner size={48} /> :
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {[
              ['Total Users',       stats?.totalUsers || 0,              'var(--accent)'],
              ['Skill Offers',      stats?.totalSkillOffers || 0,        '#8b5cf6'],
              ['Completed',         stats?.exchanges?.completed || 0,    'var(--accent3)'],
              ['Pending',           stats?.exchanges?.pending || 0,      '#ffaa00'],
              ['Messages',          stats?.totalMessages || 0,           'var(--accent2)'],
              ['Active Exchanges',  stats?.exchanges?.accepted || 0,     'var(--accent)'],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:24, textAlign:'center' }}>
                <div style={{ fontFamily:'Clash Display, sans-serif', fontSize:40, fontWeight:700, color }}>{value}</div>
                <div style={{ color:'var(--muted)', fontSize:13, marginTop:4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* USERS */}
        {tab === 'users' && (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', gap:12 }}>
              <Input value={search} onChange={e => { setSearch(e.target.value); fetchUsers(e.target.value); }} placeholder="Search by name or email…" style={{ maxWidth:340 }} />
              <BtnGhost onClick={() => fetchUsers('')} style={{ padding:'10px 16px' }}>Clear</BtnGhost>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ background:'var(--surface2)' }}>
                    {['User','Email','Rating','Joined','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'var(--muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'1px', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderTop:'1px solid var(--border)', transition:'background .2s' }}
                      onMouseOver={e => e.currentTarget.style.background='var(--surface2)'}
                      onMouseOut={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', fontWeight:600 }}>
                        {u.name} {u.is_admin && <span style={{ fontSize:11, color:'#8b5cf6', fontWeight:700 }}>(Admin)</span>}
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)' }}>{u.email}</td>
                      <td style={{ padding:'12px 16px', color:'#ffd700' }}>
                        {parseFloat(u.rating||0).toFixed(1)}
                      </td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ padding:'3px 10px', borderRadius:100, fontSize:11, fontWeight:600, background: u.is_active ? 'rgba(67,233,123,.15)' : 'rgba(255,107,107,.15)', border:`1px solid ${u.is_active ? 'rgba(67,233,123,.3)' : 'rgba(255,107,107,.3)'}`, color: u.is_active ? 'var(--accent3)' : 'var(--accent2)' }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <button onClick={() => toggleUser(u.id, u.is_active)} style={{ padding:'5px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${u.is_active ? 'rgba(255,107,107,.3)' : 'rgba(67,233,123,.3)'}`, background: u.is_active ? 'rgba(255,107,107,.08)' : 'rgba(67,233,123,.08)', color: u.is_active ? 'var(--accent2)' : 'var(--accent3)' }}>
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXCHANGES */}
        {tab === 'exchanges' && (
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
                <thead>
                  <tr style={{ background:'var(--surface2)' }}>
                    {['Requester','Provider','Skills','Status','Date'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', color:'var(--muted)', fontSize:11, textTransform:'uppercase', letterSpacing:'1px', fontWeight:600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exchanges.map(e => (
                    <tr key={e.id} style={{ borderTop:'1px solid var(--border)', transition:'background .2s' }}
                      onMouseOver={ev => ev.currentTarget.style.background='var(--surface2)'}
                      onMouseOut={ev => ev.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'12px 16px', fontWeight:600 }}>{e.requester_name}</td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)' }}>{e.provider_name}</td>
                      <td style={{ padding:'12px 16px', fontSize:12, color:'var(--muted)' }}>
                        {e.requester_skill || '—'} - {e.provider_skill || '—'}
                      </td>
                      <td style={{ padding:'12px 16px' }}><StatusBadge status={e.status} /></td>
                      <td style={{ padding:'12px 16px', color:'var(--muted)', fontSize:12 }}>{new Date(e.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SKILLS */}
        {tab === 'skills' && (
          <div style={{ maxWidth:480 }}>
            <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:32 }}>
              <h2 style={{ fontFamily:'Clash Display, sans-serif', fontSize:22, fontWeight:700, marginBottom:20 }}>Add New Skill to Platform</h2>
              <form onSubmit={addSkill}>
                <FormGroup label="Skill Name">
                  <Input value={newSkill.name} onChange={e=>setNewSkill({...newSkill, name:e.target.value})} placeholder="e.g., Blockchain Development" required />
                </FormGroup>
                <FormGroup label="Category">
                  <Select value={newSkill.category} onChange={e=>setNewSkill({...newSkill, category:e.target.value})}>
                    {['Technology','Design','Art','Music','Language','Business','Health & Fitness','Lifestyle','Media'].map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </FormGroup>
                <BtnPrimary style={{ width:'100%', padding:'13px 0', fontSize:15 }}>Add Skill</BtnPrimary>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}